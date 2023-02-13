import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { SwapPoolTabs } from '../../components/NavigationTabs';
import AppBody from '../AppBody';
import { TYPE, HideSmall, LinkStyledButton } from '../../theme';
import AddressInput from '../../components/AddressInputPanel';
import Card from '../../components/Card';
import { AutoRow, RowBetween } from '../../components/Row';
import { ButtonPrimary } from '../../components/Button';
import { AutoColumn } from '../../components/Column';

import { useActiveWeb3React } from '../../hooks';
import { useExpertModeManager } from '../../state/user/hooks';
import { ArrowWrapper, BottomGrouping } from '../../components/swap/styleds';
import { useWalletModalToggle } from 'state/application/hooks';
import { useDerivedSwapInfo, useSwapState, useSwapActionHandlers } from '../../state/swap/hooks';
import { Field } from '../../state/swap/actions';
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback';
import { ArrowDown } from 'react-feather';
import NetworkSelectPanel from 'components/NetworkSelectPanel';
import { ethers } from 'ethers';
import ABI from './abis/abi.json';
import Header from '../../components/Header';

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`;

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

interface NetworkData {
  chainId: number;
  networkName: string;
}

const contractAddressObj = {
  61115: '0x6f78cde40436D1e406CFC9e4F2ed788E0C43E929',
  137: '0x1759B3AbD81B6c27bc1B1D0a6F5EF68f4151B523',
  1: '0x1759B3AbD81B6c27bc1B1D0a6F5EF68f4151B523',
  56: '0x1759B3AbD81B6c27bc1B1D0a6F5EF68f4151B523',
};

export default function Bridge() {
  const theme = useContext(ThemeContext);
  const { account, deactivate: deactivateNetwork } = useActiveWeb3React();
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkData | null>(null);
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

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (account) {
      deactivateNetwork();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { recipient } = useSwapState();

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

  const handleSubmit = async () => {
    if (selectedNetwork && window) {
      try {
        let contractAddress = contractAddressObj[selectedNetwork.chainId as keyof typeof contractAddressObj];
        const provider = new ethers.providers.Web3Provider(window.ethereum as any);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, ABI, signer);
        const result = await contract.functions.burn(walletAddress, numberOfTokens, selectedNetwork?.chainId, {
          gasLimit: 5000000,
        });
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>
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
                    Connect to a wallet to for bridge.
                  </TYPE.body>
                </Card>
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
    </>
  );
}
