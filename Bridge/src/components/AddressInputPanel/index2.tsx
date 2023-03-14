import React, { useContext, useCallback, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import useENS from '../../hooks/useENS';
import { useActiveWeb3React } from '../../hooks';
import { ExternalLink, TYPE } from '../../theme';
import { AutoColumn } from '../Column';
import { RowBetween } from '../Row';
import { getEtherscanLink } from '../../utils';
import { Currency } from '@uniswap/sdk';
import { useTranslation } from 'react-i18next';
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg';
import TokenSelectModel from 'components/SearchModal/TokenSelectModel';

const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 1.25rem;
  background-color: ${({ theme }) => theme.bg1};
  z-index: 1;
  width: 100%;
`;

const ContainerRow = styled.div<{ error: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1.25rem;
  border: 1px solid ${({ error, theme }) => (error ? theme.red1 : theme.bg2)};
  transition: border-color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')},
    color 500ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  background-color: ${({ theme }) => theme.bg1};
`;

const InputContainer = styled.div`
  flex: 1;
  padding: 1rem;
`;

const Input = styled.input<{ error?: boolean }>`
  font-size: 1.25rem;
  outline: none;
  border: none;
  flex: 1 1 auto;
  width: 0;
  background-color: ${({ theme }) => theme.bg1};
  transition: color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error, theme }) => (error ? theme.red1 : theme.primary1)};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;
  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
  padding: 0px 6rem 0px 0px;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
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
  width: 5.5rem;
  position: absolute;
  right: 0.5rem;
  bottom: 1rem;
  :focus,
  :hover {
    background-color: ${({ theme }) => theme.bg4};
  }
`;

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
`;

const StyledDropDown = styled(DropDown)`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ theme }) => theme.text1};
    stroke-width: 1.5px;
  }
`;
export default function AddressInputPanel({
  id,
  value,
  disableCurrencySelect = false,
  currency,
  isTokenModel,
  otherCurrency,
  onChange,
  onTokenSelect,
  showCommonBases,
  token,
}: {
  id?: string;
  value: string;
  disableCurrencySelect: boolean;
  currency?: Currency | null;
  isTokenModel?: boolean;
  otherCurrency?: Currency | null;
  showCommonBases?: boolean;
  token: any;
  onTokenSelect?: (currency: any) => void;
  onChange: (value: string) => void;
}) {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const [modalOpen, setModalOpen] = useState(false);
  const { address, loading, name } = useENS(value);

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  const handleInput = useCallback(
    (event) => {
      const input = event.target.value;
      const withoutSpaces = input.replace(/\s+/g, '');
      onChange(withoutSpaces);
    },
    [onChange]
  );

  const error = Boolean(value.length > 0 && !loading && !address);

  return (
    <InputPanel id={id}>
      <ContainerRow error={error}>
        <InputContainer>
          <AutoColumn gap="md" justify="space-between">
            <RowBetween>
              <TYPE.black color={theme.text2} fontWeight={500} fontSize={14}>
                Recipient
              </TYPE.black>
              {address && chainId && (
                <ExternalLink href={getEtherscanLink(chainId, name ?? address, 'address')} style={{ fontSize: '12px' }}>
                  (View on GauraScan)
                </ExternalLink>
              )}
            </RowBetween>
            <Input
              className="recipient-address-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder="Wallet Address"
              error={error}
              pattern="^(0x[a-fA-F0-9]{40})$"
              onChange={handleInput}
              value={value}
            />
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
                  {token && token.chainId ? token.networkName : t('Token')}
                </StyledTokenName>
                {!disableCurrencySelect && <StyledDropDown />}
              </Aligner>
            </CurrencySelect>
            {isTokenModel && !disableCurrencySelect && onTokenSelect && (
              <TokenSelectModel
                isOpen={modalOpen}
                onDismiss={handleDismissSearch}
                onTokenSelect={onTokenSelect}
                selectedCurrency={currency}
                otherSelectedCurrency={otherCurrency}
                showCommonBases={showCommonBases}
              />
            )}
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  );
}
