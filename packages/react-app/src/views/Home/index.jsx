import React from 'react';
import { Row, Col } from 'antd';

import { Button } from '../../components/tailwind/';

export default function Home({ localProvider, tx, readContracts, writeContracts, address, price, gasPrice }) {
  const mint = async () => {
    try {
      const account = address;
      const id = '0';
      const amount = '100';
      const data = '0x';
      const args = {
        account,
        id,
        amount,
        data,
      };
      console.log({ args });
      const mintResult = await tx(
        writeContracts.DAOMembershipToken.mint(args.account, args.id, args.amount, args.data),
      );
      console.log({ mintResult });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Row gutter={[16, 24]} className="py-4">
      <Col className="gutter-row" md={8} xs={24}>
        <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg">
          <Button color="blue" onClick={() => mint()}>
            Click
          </Button>
        </div>
      </Col>
    </Row>
  );
}
