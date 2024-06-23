import { Container } from 'typedi';

export default ({ DbTransactions }) => {
  Container.set('DbTransactions', DbTransactions);
};
