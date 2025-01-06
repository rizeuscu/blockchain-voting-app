import { contractAddress } from 'config';
import { AuthRedirectWrapper } from 'wrappers';
import {
  Account,
  PingPongRaw,
  Transactions
} from './widgets';
import { useScrollToElement } from 'hooks';
import { Widget } from './components';
import { WidgetType } from 'types/widget.types';
import ContractQuery from './widgets/Query/ContractQuery';
import { Card } from 'components';

const WIDGETS: WidgetType[] = [
  {
    title: 'Account',
    widget: Account,
    description: 'Connected account details',
    reference: 'https://docs.multiversx.com/sdk-and-tools/sdk-dapp/#account'
  },
  {
    title: 'Voting Transactions',
    widget: Transactions,
    props: { receiver: contractAddress },
    description: 'Connected account voting related transactions',
    reference:
      'https://api.elrond.com/#/accounts/AccountController_getAccountTransactions'
  }
];

export const Dashboard = () => {
  useScrollToElement();

  return (
    <AuthRedirectWrapper>
      <div className='flex flex-col gap-6 max-w-3xl w-full'>
        {WIDGETS.map((element) => (
          <Widget key={element.title} {...element} />
        ))}
        <Card
          title='Elections Data and Results'
          description='All important details about past and current elections'
          reference='https://api.elrond.com/#/query'>
          <ContractQuery functionName='getElectionsMetadata' />
        </Card>
      </div>
    </AuthRedirectWrapper>
  );
};
