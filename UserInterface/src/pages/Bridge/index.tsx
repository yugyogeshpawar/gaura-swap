import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { Pair } from '@uniswap/sdk';
import { SwapPoolTabs } from '../../components/NavigationTabs';
import AppBody from '../AppBody';
import FullPositionCard from '../../components/PositionCard';
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks';
import { TYPE, HideSmall, LinkStyledButton } from '../../theme';
import AddressInput from '../../components/AddressInputPanel';
import Card from '../../components/Card';
import { AutoRow, RowBetween } from '../../components/Row';
import { ButtonPrimary } from '../../components/Button';
import { AutoColumn } from '../../components/Column';

import { useActiveWeb3React } from '../../hooks';
import { usePairs } from '../../data/Reserves';
import {
  toV2LiquidityToken,
  useExpertModeManager,
  useTrackedTokenPairs,
  useUserSlippageTolerance,
} from '../../state/user/hooks';
import { ArrowWrapper, BottomGrouping, Dots } from '../../components/swap/styleds';
import { useWalletModalToggle } from 'state/application/hooks';
import { useDerivedSwapInfo, useSwapState, useSwapActionHandlers } from '../../state/swap/hooks';
import { Field } from '../../state/swap/actions';
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback';
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback';
import { ArrowDown } from 'react-feather';
import NetworkSelectPanel from 'components/NetworkSelectPanel';

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
  padding: 1rem;
`;

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`;

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
interface NetworkData {
  chainId: number;
  networkName: string;
}

export default function Pool() {
  const theme = useContext(ThemeContext);
  const { account } = useActiveWeb3React();
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkData|null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [numberOfTokens, setNumberOfTokens] = useState('');

  const toggleWalletModal = useWalletModalToggle();
  const { currencies } = useDerivedSwapInfo();
  const { typedValue } = useSwapState();
  const [isExpertMode] = useExpertModeManager();
  const {
    wrapType,
    // execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const { v2Trade, parsedAmount } = useDerivedSwapInfo();
  const trade = showWrap ? undefined : v2Trade;

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance();

  // check whether the user has approved the router on the input token
  const [approval] = useApproveCallbackFromTrade(trade, allowedSlippage);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs();
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  );
  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens]
  );
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  );
  const { recipient } = useSwapState();

  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  );

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens));
  const v2IsLoading =
    fetchingV2PairBalances ||
    v2Pairs?.length < liquidityTokensWithBalances.length ||
    v2Pairs?.some((V2Pair) => !V2Pair);
  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair));

  const { independentField } = useSwapState();

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;
  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      };
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  const { onSwitchTokens, onUserInput, onChangeRecipient, onCurrencySelection } = useSwapActionHandlers();

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
      setNumberOfTokens(value);
    },
    [onUserInput]
  );

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      setSelectedNetwork(outputCurrency);
      onCurrencySelection(Field.OUTPUT, outputCurrency);
    },
    [onCurrencySelection]
  );
  
  const handleAddressChange = (address: string) => {
    setWalletAddress(address);
  };

  const handleSubmit = () => {
    if(selectedNetwork){
      const reqObj = {
        walletAddress,
        chainId: selectedNetwork.chainId,
        networkName: selectedNetwork.networkName,
        token: numberOfTokens,
      };
      console.log(reqObj);
    }
  };

  return (
    <AppBody>
      <PageWrapper>
        <SwapPoolTabs active={'bridge'} />
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow padding={'0'}>
              <HideSmall>
                <TYPE.mediumHeader style={{ justifySelf: 'flex-start' }}>Bridge</TYPE.mediumHeader>
              </HideSmall>
            </TitleRow>

            {!account ? (
              <Card padding="40px">
                <TYPE.body color={theme.text3} textAlign="center">
                  Connect to a wallet to view your liquidity.
                </TYPE.body>
              </Card>
            ) : v2IsLoading ? (
              <EmptyProposals>
                <TYPE.body color={theme.text3} textAlign="center">
                  <Dots>Loading</Dots>
                </TYPE.body>
              </EmptyProposals>
            ) : allV2PairsWithLiquidity?.length > 0 ? (
              <>
                {allV2PairsWithLiquidity.map((v2Pair) => (
                  <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                ))}
              </>
            ) : (
              <AutoColumn gap={'md'}>
                <AddressInput
                  value={walletAddress}
                  onChange={(val: any) => {
                    handleAddressChange(val);
                  }}
                />
                <AutoColumn justify="space-between">
                  <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                    <ArrowWrapper clickable>
                      <ArrowDown
                        size="16"
                        onClick={() => {
                          setApprovalSubmitted(false);
                          onSwitchTokens();
                        }}
                        color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                      />
                    </ArrowWrapper>
                    {recipient === null && !showWrap && isExpertMode ? (
                      <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                        + Add a send (optional)
                      </LinkStyledButton>
                    ) : null}
                  </AutoRow>
                </AutoColumn>
                <NetworkSelectPanel
                  value={formattedAmounts[Field.OUTPUT]}
                  onUserInput={handleTypeOutput}
                  label={'To'}
                  showMaxButton={false}
                  onCurrencySelect={handleOutputSelect}
                  otherCurrency={currencies[Field.INPUT]}
                  id="swap-currency-output"
                  isNetworkModel
                  network={selectedNetwork}
                />
              </AutoColumn>
            )}
            <div>
              <BottomGrouping>
                {!account ? (
                  <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
                ) : (
                  <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={handleSubmit}>
                    Submit
                  </ButtonPrimary>
                )}
              </BottomGrouping>
            </div>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </AppBody>
  );
}
