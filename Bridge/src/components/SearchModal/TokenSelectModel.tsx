import { Currency } from '@uniswap/sdk';
import React from 'react';
import Modal from '../Modal';
import styled from 'styled-components';
import Column from '../Column';
import { PaddedColumn } from './styleds';
import { RowBetween } from '../Row';
import { Text } from 'rebass';
import { CloseIcon } from '../../theme';
// import { useActiveWeb3React } from 'hooks';

interface CurrencySearchModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onTokenSelect: (currency: any) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
}

interface TokenData {
  chainId: number;
  contractAddress: string;
  networkName: string;
}

export enum CurrencyModalView {
  search,
  manage,
  importToken,
  importList,
}
const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;
`;

const NetworkSelect = styled.button`
  align-items: center;
  width: 100%;
  height: 2.2rem;
  font-size: 18px;
  font-weight: 500;
  border: none;
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
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

export default function TokenSelectModel({ isOpen, onDismiss, onTokenSelect }: CurrencySearchModalProps) {
  // const { chainId } = useActiveWeb3React();

  const handleNetworkSelect = (token: TokenData) => {
    onTokenSelect(token);
    onDismiss();
  };

  const minHeight = 30;

  const tokenData: TokenData[] = [
    {
      chainId: 56,
      contractAddress: '0x32b8376f42af40C58Cfbb7B69908EC66EcE07d7D',
      networkName: 'Anna',
    },
    {
      chainId: 61115,
      contractAddress: '0xE4821faf6E65Bf091119E33dF694033F4C6d173D',
      networkName: 'Aura',
    },
    {
      chainId: 1,
      contractAddress: '0x694D613F79A6852bED0AE1CeC6D5cab62C724dF3',
      networkName: 'BoomX',
    },
    {
      chainId: 137,
      contractAddress: '0xe0d2a21b86b334C507c376f71Ed5061740F8735f',
      networkName: '5Paisa',
    },
    {
      chainId: 137,
      contractAddress: '0x4F0b872be3f988296D69492C67cd0F9B17e57a7E',
      networkName: 'FinalX',
    },
  ];

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={minHeight}>
      <ContentWrapper>
        <PaddedColumn gap="16px">
          <RowBetween>
            <Text fontWeight={500} fontSize={16}>
              Select a token
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>

          {tokenData.map((network: TokenData, index: number) => (
            // network.chainId !== chainId &&
            <RowBetween key={index}>
              <NetworkSelect key={index} onClick={() => handleNetworkSelect(network)}>
                {network.networkName}
              </NetworkSelect>
            </RowBetween>
          ))}
        </PaddedColumn>
      </ContentWrapper>
    </Modal>
  );
}
