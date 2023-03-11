import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css';
import { useState , useEffect , useRef } from 'react';
import { Contract , providers } from 'ethers';
import Web3Modal from "web3modal";
import { abi, contractAddress } from '@/constant';



const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const web3ModalRef = useRef();

  const getProviderorSigner = async(needSigner = false)=>{
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const {chainId} = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      // throw new Error("Change network to Goerli");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner('0x71E99529857c5B9bc1C4B5a275B9C96FEDC8B33C');
      return signer;
    }
    return web3Provider;
  }

  const checkAddressIsWhiteListed = async()=>{
    try {
      const signer = await getProviderorSigner(true);
      const contract = new Contract(contractAddress , abi , signer);
      console.log(contract);
      const address = await signer.getAddress();
      console.log(address);
      const _joinedWhiteList = await contract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhiteList);
    } catch (error) {
      console.log(error)
    }
  }

  const addAddressToWhitelist = async()=>{
    try {
      const signer = await getProviderorSigner(true);
      const contract = new Contract(contractAddress , abi , signer);
      console.log(contract);
      const tx = await contract.addAddressToWhiteListed({gasLimit: 30000});
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // get the updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (error) {
      console.log(error.message)
    }
  }
  const connectWallet = async()=>{
    try {
      const result = await getProviderorSigner(true);
      console.log(result);
      setWalletConnected(true);
      checkAddressIsWhiteListed();
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      // connectWallet();
      // console.log( getProviderorSigner)
    }
  }, [])
  

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  return (
    <>
      <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its a whitelister website for our upcoming project <b>NFT collection</b> for developers.
          </div>
          <div className={styles.description}>
            {/* {numberOfWhitelisted} have already joined the Whitelist */}
          </div>
          {renderButton()}
        </div>
        <div>
          {/* <img className={styles.image} src="./crypto-devs.svg" /> */}
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Skywalker Sameer
      </footer>
    </div>
    </>
  )
}
