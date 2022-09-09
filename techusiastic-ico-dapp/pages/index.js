import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { BigNumber, Contract, providers, utils } from "ethers";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  const zero = BigNumber.from(0);

  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const [balanceOfTechusiasticTokens, setBalanceOfTechusiasticTokens] =
    useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [isOwner, setIsOwner] = useState(false);

  const web3ModalRef = useRef();

  const getTokensToBeClaimed = async () => {
    try {
      const provider = await getProvider();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const signer = await getProvider(true);

      const address = await signer.getAddress();

      const balance = await nftContract.balanceOf(address);
      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        let amount = 0;

        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (error) {
      console.error(error);
      setTokensToBeClaimed(zero);
    }
  };

  const getBalanceOfTechusiasticTokens = async () => {
    try {
      const provider = await getProvider();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const signer = await getProvider(true);

      const address = await signer.getAddress();

      const balance = await tokenContract.balanceOf(address);

      setBalanceOfTechusiasticTokens(balance);
    } catch (error) {
      console.error(error);
      setBalanceOfTechusiasticTokens(zero);
    }
  };

  const mintTechusiasticToken = async (amount) => {
    try {
      const signer = await getProvider(true);

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const value = 0.001 * amount;

      const transaction = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await transaction.wait();
      setLoading(false);
      window.alert("Successfully minted Techusiastic Token");

      await getBalanceOfTechusiasticTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  };

  const cliamTechusiasticTokens = async () => {
    try {
      const signer = await getProvider(true);

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const transaction = await tokenContract.claim();
      setLoading(true);
      await transaction.wait();
      setLoading(false);
      window.alert("Successfully claimed Techusiastic Token");

      await getBalanceOfTechusiasticTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  };

  const getTotalTokensMinted = async () => {
    try {
      const provider = await getProvider();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const _tokensMinted = await tokenContract.totalSupply();

      setTokensMinted(_tokensMinted);
    } catch (error) {
      console.error(error);
    }
  };

  const getOwner = async () => {
    try {
      const provider = await getProvider();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const _owner = await tokenContract.owner();

      const signer = await getProvider(true);

      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const withdraw = async () => {
    try {
      const signer = await getProvider();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const transaction = await tokenContract.withdraw();
      setLoading(true);
      await transaction.wait();
      setLoading(false);
      await getOwner();
    } catch (error) {
      console.error(error);
    }
  };

  const getProvider = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change network to Goerli");
      throw new Error("Change newwork to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProvider();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "georli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfTechusiasticTokens();
      getTokensToBeClaimed();
      withdraw();
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (loading) {
      <diiv>
        <button className={styles.button}>Loading...</button>
      </diiv>;
    }

    if (walletConnected && isOwner) {
      <diiv>
        <button className={styles.button1} onClick={withdrawCoins}>
          Witndraw Coins
        </button>
      </diiv>;
    }

    if (tokensToBeClaimed > 0) {
      <div>
        <div className={styles.description}>
          {tokensToBeClaimed * 10} Tokens can be claimed
        </div>
        <button className={styles.button} onClick={cliamTechusiasticTokens}>
          Claim Tokens
        </button>
      </div>;
    }

    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            // BigNumber.from converts the `e.target.value` to a BigNumber
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintTechusiasticToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Techusiastics</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/techusiastic.png" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to <span className={styles.techusiastic}>Techusiastics</span> ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {utils.formatEther(balanceOfTechusiasticTokens)}{" "}
                Crypto Dev Tokens
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {utils.formatEther(tokensMinted)}/10000 have been
                minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by <Link href="https://github.com/J0shcodes"><a className={styles.link}>J0shcodes</a></Link>
      </footer>
    </div>
  );
}
