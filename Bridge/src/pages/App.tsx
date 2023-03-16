import React, { Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import Polling from '../components/Header/Polling';
import Popups from '../components/Popups';
import Web3ReactManager from '../components/Web3ReactManager';
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader';
import { RedirectPathToSwapOnly } from './Swap/redirects';
import Bridge from './Bridge';

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: flex-start;
  overflow-x: hidden;
`;

const BodyWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
`;

interface Props {
  exact?: boolean;
  link: string;
  path: string;
  sensitive?: boolean;
  strict?: boolean;
}

const ExternalRedirect: React.FC<Props> = (props: Props) => {
  const { link, ...routeProps } = props;

  return (
    <Route
      {...routeProps}
      render={() => {
        window.location.replace(props.link);
        return null;
      }}
    />
  );
};

export default function App() {
  return (
    <Suspense fallback={null}>
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper>
        <BodyWrapper>
          <Popups />
          <Polling />
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/bridge" component={Bridge} />
              <ExternalRedirect exact={true} path={'/swap'} link={'https://app.cloudswap.trade/#swap'} />
              <ExternalRedirect exact={true} path={'/pool'} link={'https://app.cloudswap.trade/#/pool'} />
              <Route component={RedirectPathToSwapOnly} />
            </Switch>
          </Web3ReactManager>
        </BodyWrapper>
      </AppWrapper>
    </Suspense>
  );
}
