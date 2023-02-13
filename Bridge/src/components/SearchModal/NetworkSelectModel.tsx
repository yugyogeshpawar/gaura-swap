import { Currency } from '@uniswap/sdk';
import React from 'react';
import Modal from '../Modal';
import styled from 'styled-components';
import Column from '../Column';
import { PaddedColumn } from './styleds';
import { RowBetween } from '../Row';
import { Text } from 'rebass';
import { CloseIcon } from '../../theme';
import { useActiveWeb3React } from 'hooks';

interface CurrencySearchModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: any) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
}

interface NetworkData {
  chainId: number;
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

export default function NetworkSelectModel({
  isOpen,
  onDismiss,
  onCurrencySelect,
}: CurrencySearchModalProps) {
  const { chainId } = useActiveWeb3React();

  const handleNetworkSelect = (network: NetworkData) => {
    onCurrencySelect(network);
    onDismiss()
  };

  const minHeight = 30;

  const networkData: NetworkData[] = [
    {
      chainId: 56,
      networkName: 'Binance',
    },
    {
      chainId: 61115,
      networkName: 'Gaura',
    },
    {
      chainId: 1,
      networkName: 'Ethereum',
    },
    {
      chainId: 137,
      networkName: 'Polygon',
    },
  ];

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={minHeight}>
      <ContentWrapper>
        <PaddedColumn gap="16px">
          <RowBetween>
            <Text fontWeight={500} fontSize={16}>
              Select a network
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>

          {networkData.map(
            (network: NetworkData, index: number) =>
              network.chainId !== chainId && (
                <RowBetween key={index}>
                  <NetworkSelect key={index} onClick={() => handleNetworkSelect(network)}>
                    {network.networkName}
                  </NetworkSelect>
                </RowBetween>
              )
          )}
        </PaddedColumn>
      </ContentWrapper>
    </Modal>
  );
}
