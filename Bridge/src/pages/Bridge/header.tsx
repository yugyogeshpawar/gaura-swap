import React, { useState } from 'react';
import { Text } from 'rebass';
import { NavLink } from 'react-router-dom';
import { darken } from 'polished';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Logo from '../../assets/svg/logo.svg';
import LogoDark from '../../assets/svg/logo.svg';
// import { useActiveWeb3React } from '../../hooks';
import { useDarkModeManager } from '../../state/user/hooks';
// import { useETHBalances } from '../../state/wallet/hooks';
import { Moon, Sun } from 'react-feather';
import Row, { RowFixed } from '../../components/Row';
import Web3Status from '../../components/Web3Status';

const HeaderFrame = styled.div`
  width: 100vw;
  margin: 0.8rem auto;
  padding: 0.8rem 1.6rem;
  z-index: 2;
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 60px 1fr 120px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 60px 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.5rem 1rem;
  `}
`;

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`;

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`;

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRow = styled(RowFixed)`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
  `};
`;

const HeaderLinks = styled(Row)`
  width: auto;
  margin: 0 auto;
  padding: 0.3rem;
  justify-content: center;
  border-radius: 0.8rem;
  box-shadow: rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px,
    rgba(0, 0, 0, 0.01) 0px 24px 32px;
  background-color: ${({ theme }) => theme.bg1};

  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin: 0;
    margin-right: auto;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: fixed;
    bottom: 0;
    padding: .5rem;
    width: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 0;
    border-top: 1px solid ${({ theme }) => theme.bg3};
  `};
`;

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 0.8rem;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;
  box-shadow: rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px,
    rgba(0, 0, 0, 0.01) 0px 24px 32px;

  :focus {
    border: 1px solid blue;
  }
`;

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`;

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`;

const Icon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: scale(1.1);
  }
`;

const activeClassName = 'ACTIVE';

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 0.9rem;
  width: fit-content;
  padding: 0.3rem 0.6rem;
  font-weight: 500;
  transition: 0.3s;

  &:not(:last-child) {
    margin-right: 0.16rem;
  }

  &.${activeClassName} {
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg3};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    border-radius: 8px;
    padding: 0.3rem 7%;
    border: 1px solid ${({ theme }) => theme.bg3};

    &:not(:last-child) {
      margin-right: 2%;
    }
  `};
`;

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  box-shadow: rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px,
    rgba(0, 0, 0, 0.01) 0px 24px 32px;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`;

export default function Header() {
//   const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
//   const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? ''];
  const [darkMode, toggleDarkMode] = useDarkModeManager();
    const [accountAddress, setAccountAddress] = useState('');
    const [chainId, setChainId] = useState<any>(0);
  const nativeTokenName = () => {
    console.log(chainId)
    switch (chainId) {
      case '0x1':
        return 'ETH';
      case 61115:
        return 'GAURA';
      case 137:
        return 'MATIC';
      default:
        return chainId;
    }
  };

  const connectWallet = async () => {
    console.log('Connect fired');
    try {
      //   if (!ethereum) {
      //     sethaveMetamask(false);
      //   }
      if (window.ethereum as any) {
        const eth = window.ethereum as any;
        const accounts = await eth.request({
          method: 'eth_requestAccounts',
        });
        setAccountAddress(accounts[0]);
        console.log(accounts);
        const currentChain = await eth.request({ method: 'eth_chainId' });
        setChainId(currentChain);
      }

      // let balance = await provider.getBalance(accounts[0])
      // let bal = ethers.utils.formatEther(balance)
      //   setIsConnected(true);
      //   checkChain();
    } catch (error) {
      //   setIsConnected(false);
    }
  };

  return (
    <HeaderFrame>
      <HeaderRow>
        <Title href=".">
          <Icon>
            <img width={'48px'} src={darkMode ? LogoDark : Logo} alt="logo" />
          </Icon>
        </Title>
      </HeaderRow>

      <HeaderLinks>
        <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
          {t('swap')}
        </StyledNavLink>
        <StyledNavLink id={`bridge-nav-link`} to={'/bridge'}>
          {t('Bridge')}
        </StyledNavLink>
        <StyledNavLink
          id={`pool-nav-link`}
          to={'/pool'}
          isActive={(match, { pathname }) =>
            Boolean(match) ||
            pathname.startsWith('/add') ||
            pathname.startsWith('/remove') ||
            pathname.startsWith('/create') ||
            pathname.startsWith('/find')
          }
        >
          {t('pool')}
        </StyledNavLink>
      </HeaderLinks>

      <HeaderControls>
        <HeaderElement>
          <AccountElement active={!!accountAddress} style={{ pointerEvents: 'auto' }}>
            {accountAddress !== "" ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {chainId && nativeTokenName()}
              </BalanceText>
            ) : null}
            <Web3Status bridge={true} accountAddress={accountAddress}/>
          </AccountElement>
          {!accountAddress && <div onClick={connectWallet}>Connect Wallet</div>}
          {/* <div>{accountAddress}</div> */}
        </HeaderElement>
        <HeaderElementWrap>
          <StyledMenuButton onClick={toggleDarkMode}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  );
}
