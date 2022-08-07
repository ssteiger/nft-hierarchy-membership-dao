import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'antd';
import { useContractReader } from 'eth-hooks';

import { Button, Input } from '../../components/tailwind/';

const getReputationLevelBaseUri = (_reputationBalance, reputationLevels, reputationLevelBaseUris) => {
  const reputationBalance = parseInt(_reputationBalance);
  let reputationLevelIndex;
  if (!reputationLevels || !reputationLevelBaseUris) return;

  for (let i = 0; i < reputationLevels.length; i++) {
    const reputationLevel = parseInt(reputationLevels[i]);
    if (reputationLevel <= reputationBalance) {
      reputationLevelIndex = i;
    }
  }

  return reputationLevelBaseUris[reputationLevelIndex];
};

export default function Home({ localProvider, tx, readContracts, writeContracts, address, price, gasPrice }) {
  const ERC20_REPUTATION_TOKEN_ID = '0';
  const reputationLevels = useContractReader(readContracts, 'DAOMembershipToken', 'reputationLevels');
  const reputationLevelsCount = reputationLevels ? reputationLevels.length : 0;
  const reputationLevelBaseUris = useContractReader(readContracts, 'DAOMembershipToken', 'reputationLevelBaseUris');
  const totalNFTSupply = useContractReader(readContracts, 'DAOMembershipToken', 'totalNFTSupply');

  /*
  console.log({ reputationLevels });
  console.log({ reputationLevelsCount });
  console.log({ reputationLevelBaseUris });
  console.log({ totalNFTSupply });
  console.log({ address });
  */

  const [userReputationBalance, setUserReputationBalance] = useState('0');
  const [isNFTHolder, setIsNFTHolder] = useState(false);

  const fetchReputationBalance = async _address => {
    try {
      if (readContracts) {
        let balanceOf = await readContracts.DAOMembershipToken.balanceOf(_address, ERC20_REPUTATION_TOKEN_ID);
        balanceOf = balanceOf.toString() || '0';
        setUserReputationBalance(balanceOf);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkIfIsNFTHolder = async _address => {
    try {
      if (readContracts) {
        const isNFTHolder = await readContracts.DAOMembershipToken.isNFTHolder(_address);
        setIsNFTHolder(isNFTHolder);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReputationBalance(address);
    checkIfIsNFTHolder(address);
  }, [address, totalNFTSupply, readContracts]);

  const [formMintNFT] = Form.useForm();
  const [formMintReputation] = Form.useForm();

  const mintReputationTokens = async values => {
    const { address, amount } = values;
    try {
      const args = {
        to: address,
        id: ERC20_REPUTATION_TOKEN_ID,
        amount,
        data: '0x',
      };
      console.log({ args });
      const mintResult = await tx(writeContracts.DAOMembershipToken.mint(args.to, args.id, args.amount, args.data));
      console.log({ mintResult });
    } catch (e) {
      console.error(e);
    }
  };

  const mintNFT = async values => {
    const { to } = values;
    console.log({ totalNFTSupply: totalNFTSupply.toString() });
    try {
      const args = {
        to,
        id: totalNFTSupply.add('1').toString(),
        amount: '1',
        data: '0x',
      };
      console.log({ args });
      const mintResult = await tx(writeContracts.DAOMembershipToken.mint(args.to, args.id, args.amount, args.data));
      console.log({ mintResult });
    } catch (e) {
      console.error(e);
    }
  };

  const userReputationLevelBaseUri = getReputationLevelBaseUri(
    userReputationBalance,
    reputationLevels,
    reputationLevelBaseUris,
  );

  /*
  console.log({ isNFTHolder });
  console.log({ userReputationBalance });
  console.log({ userReputationLevelBaseUri });
  */

  return (
    <Row gutter={[16, 24]} className="py-4">
      <Col className="gutter-row" md={8} xs={24}>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <b>Local signer</b>
          <br />
          <br />
          is NFT holder: {`${isNFTHolder}`}
          <br />
          reputation balance: {userReputationBalance}
          <br />
          reputation level: {userReputationLevelBaseUri}
          <br />
        </div>
      </Col>
      <Col className="gutter-row" md={8} xs={24}>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <Form form={formMintReputation} onFinish={mintReputationTokens}>
            <b>Award reputation tokens [erc20]</b>
            <br />
            <br />
            <b>to</b>
            <Form.Item name="address" noStyle rules={[{ required: true, message: 'Address is required' }]}>
              <Input placeholder="address" />
            </Form.Item>
            <b>amount</b>
            <Form.Item name="amount" noStyle rules={[{ required: true, message: 'Amount is required' }]}>
              <Input placeholder="uint256" />
            </Form.Item>

            <Button type="submit" color="lightblue" className="mt-3">
              execute
            </Button>
          </Form>
        </div>
      </Col>
      <Col className="gutter-row" md={8} xs={24}>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <b>Reputation levels</b>
          <br />
          <br />
          {[...Array(reputationLevelsCount).keys()]?.map(index => {
            if (reputationLevels?.length && reputationLevelBaseUris?.length) {
              return (
                <p>
                  {`rep > ${reputationLevels[index]}`} = {reputationLevelBaseUris[index]}
                </p>
              );
            }
          })}
        </div>
      </Col>
      <Col className="gutter-row" md={8} xs={24}>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <Form form={formMintNFT} onFinish={mintNFT}>
            <b>Mint NFT membership</b>
            <br />
            <br />
            <b>to</b>
            <Form.Item name="to" noStyle rules={[{ required: true, message: 'To address is required' }]}>
              <Input name="address" placeholder="address" />
            </Form.Item>
            {/*
              <b>tokenId</b>
              <Form.Item name="tokenId" noStyle rules={[{ required: true, message: 'TokenId is required' }]}>
                <Input placeholder="uint256" />
              </Form.Item>
              */}
            <Button type="submit" color="lightblue" className="mt-3">
              mint
            </Button>
          </Form>
        </div>
      </Col>
      <Col className="gutter-row" md={8} xs={24}>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <b>Set new reputation levels</b>
          <br />
          <br />
          <b>reputationLevels</b>
          <Input name="reputationLevels" placeholder="[0, 100, ...]" />
          <b>reputationLevelBaseUris</b>
          <Input name="reputationLevelBaseUris" placeholder="[ipfs://level1, ipfs://level2, ...]" />
          <Button color="lightblue" className="mt-3" onClick={() => console.log('')}>
            execute
          </Button>
        </div>
      </Col>
    </Row>
  );
}
