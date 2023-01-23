import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { Pair, CurrencyAmount } from '@uniswap/sdk';
// import { Link } from 'react-router-dom';
import { SwapPoolTabs } from '../../components/NavigationTabs';
import AppBody from '../AppBody';
import FullPositionCard from '../../components/PositionCard';
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks';
import { TYPE, HideSmall, LinkStyledButton } from '../../theme';
// import { Text } from 'rebass';
import Card from '../../components/Card';
// import { RowBetween, RowFixed } from '../../components/Row';
import { AutoRow, RowBetween } from '../../components/Row';
import { ButtonPrimary } from '../../components/Button';
import { AutoColumn } from '../../components/Column';

import { useActiveWeb3React } from '../../hooks';
import { usePairs } from '../../data/Reserves';
import { toV2LiquidityToken, useExpertModeManager, useTrackedTokenPairs, useUserSlippageTolerance } from '../../state/user/hooks';
import { ArrowWrapper, BottomGrouping, Dots } from '../../components/swap/styleds';
import { useWalletModalToggle } from 'state/application/hooks';
import {
  useDerivedSwapInfo,
  useSwapState,
  useSwapActionHandlers,
} from '../../state/swap/hooks';
import { Field } from '../../state/swap/actions';
import CurrencyInputPanel from 'components/CurrencyInputPanel';
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback';
import { ArrowDown } from 'react-feather';

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

// const ButtonRow = styled(RowFixed)`
//   gap: 8px;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     width: 100%;
//     flex-direction: row-reverse;
//     justify-content: space-between;
//   `};
// `;

// const ResponsiveButtonPrimary = styled(ButtonPrimary)`
//   width: fit-content;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     width: 48%;
//   `};
// `;

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default function Pool() {
  const theme = useContext(ThemeContext);
  const { account } = useActiveWeb3React();
  // toggle wallet when disconnected
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
  const { v2Trade, parsedAmount, currencyBalances } = useDerivedSwapInfo();
  const trade = showWrap ? undefined : v2Trade;

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance();

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage);

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

  // fetch the reserves for all V2 pools in which the user has a balance
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
  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput));
  const { onSwitchTokens, onUserInput, onChangeRecipient, onCurrencySelection } = useSwapActionHandlers();
  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput]
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput]
  );

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  );

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency);
    },
    [onCurrencySelection]
  );
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
              {/* <ButtonRow>
                <ResponsiveButtonPrimary as={Link} padding="6px 10px" to="/create/ETH">
                  Create a pair
                </ResponsiveButtonPrimary>
                <ResponsiveButtonPrimary id="join-pool-button" as={Link} padding="6px 10px" to="/add/ETH">
                  <Text fontWeight={500} fontSize={16}>
                    Add Liquidity
                  </Text>
                </ResponsiveButtonPrimary>
              </ButtonRow> */}
            </TitleRow>

            {account ? (
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
                <CurrencyInputPanel
                  label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
                  value={formattedAmounts[Field.INPUT]}
                  showMaxButton={!atMaxAmountInput}
                  currency={currencies[Field.INPUT]}
                  onUserInput={handleTypeInput}
                  onMax={handleMaxInput}
                  onCurrencySelect={handleInputSelect}
                  otherCurrency={currencies[Field.OUTPUT]}
                  id="swap-currency-input"
                />
                <AutoColumn justify="space-between">
                  <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                    <ArrowWrapper clickable>
                      <ArrowDown
                        size="16"
                        onClick={() => {
                          setApprovalSubmitted(false); // reset 2 step UI for approvals
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
                <CurrencyInputPanel
                  value={formattedAmounts[Field.OUTPUT]}
                  onUserInput={handleTypeOutput}
                  label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : 'To'}
                  showMaxButton={false}
                  currency={currencies[Field.OUTPUT]}
                  onCurrencySelect={handleOutputSelect}
                  otherCurrency={currencies[Field.INPUT]}
                  id="swap-currency-output"
                />
              </AutoColumn>
            )}
            <div>
              <BottomGrouping>
                {!account ? (
                  <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
                ) : (
                  <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={approveCallback}>
                    Submit
                  </ButtonPrimary>
                )}
              </BottomGrouping>
              {/* <TitleRow>
                <HideSmall>
                  <TYPE.mediumHeader style={{ justifySelf: 'flex-start' }}>Didn't Find Your Pool</TYPE.mediumHeader>
                </HideSmall>
                <ButtonRow>
                  <ResponsiveButtonPrimary id="import-pool-link" as={Link} padding="6px 10px" to="/find">
                    <Text fontWeight={500} fontSize={16}>
                      Import Custom Pool
                    </Text>
                  </ResponsiveButtonPrimary>
                </ButtonRow>
              </TitleRow> */}
            </div>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </AppBody>
  );
}
