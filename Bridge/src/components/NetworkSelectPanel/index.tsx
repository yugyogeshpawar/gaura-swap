import { Currency, Pair } from '@uniswap/sdk';
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import { RowBetween } from '../Row';
import { TYPE } from '../../theme';
import { Input as NumericalInput } from '../NumericalInput';
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg';
import { useTranslation } from 'react-i18next';
import useTheme from '../../hooks/useTheme';
import NetworkSelectModel from 'components/SearchModal/NetworkSelectModel';

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.8rem 0.6rem 0.8rem 1.1rem' : '0.8rem 0.8rem 0.8rem 1.1rem')};
`;

const CurrencySelect = styled.button`
  align-items: center;
  height: 2.2rem;
  font-size: 20px;
  font-weight: 500;
  border: none;
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text1};
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;
  transition: 0.2s;

  :focus,
  :hover {
    background-color: ${({ theme }) => theme.bg4};
  }
`;

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`;

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledDropDown = styled(DropDown)`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ theme }) => theme.text1};
    stroke-width: 1.5px;
  }
`;

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: ${({ theme }) => theme.bg1};
  z-index: 1;
`;

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  border: 1px solid ${({ theme }) => theme.bg3};
`;

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
`;

interface NetworkData {
  chainId: number;
  networkName: string;
}

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax?: () => void;
  showMaxButton: boolean;
  label?: string;
  onCurrencySelect?: (currency: any) => void;
  network?: NetworkData | null;
  disableCurrencySelect?: boolean;
  hideBalance?: boolean;
  pair?: Pair | null;
  hideInput?: boolean;
  otherCurrency?: Currency | null;
  id: string;
  showCommonBases?: boolean;
  customBalanceText?: string;
  isNetworkModel?: boolean;
}

export default function NetworkSelectPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  network,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
  isNetworkModel,
}: CurrencyInputPanelProps) {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <LabelRow>
            <RowBetween>
              <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
                {label}
              </TYPE.body>
            </RowBetween>
          </LabelRow>
        )}
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
          {!hideInput && (
            <>
              <NumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={(val) => {
                  onUserInput(val);
                }}
              />
            </>
          )}
          <CurrencySelect
            className="open-currency-select-button"
            onClick={() => {
              if (!disableCurrencySelect) {
                setModalOpen(true);
              }
            }}
          >
            <Aligner>
              <StyledTokenName className="token-symbol-container">
                {network && network.chainId ? network.networkName : t('Network')}
              </StyledTokenName>
              {!disableCurrencySelect && <StyledDropDown />}
            </Aligner>
          </CurrencySelect>
        </InputRow>
      </Container>

      {isNetworkModel && !disableCurrencySelect && onCurrencySelect && (
        <NetworkSelectModel
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </InputPanel>
  );
}
