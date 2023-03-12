import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { Program, web3, BN, Provider} from '@project-serum/anchor';
import React, { FC, ReactNode, useMemo } from 'react';
import idl from './idl.json';

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            
            new UnsafeBurnerWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const wallet = useAnchorWallet();

    function getProvider() {
        if(!wallet){
            return null;
        }
        const network = "http://127.0.0.1.8899";
        const connection = new Connection(network, "processed");

        const provider = new Provider
        (connection, wallet, {"preflightCommitment": "processed"}
        );
        return provider;
    }

    async function createCounter(){
        const provider = getProvider()
        if(!provider){
            throw("Provider is null");
        }

        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);

        try{
            await program.rpc.initialize({
                accounts: {
                    myAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [baseAccount],
            });

            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log('account', account);
        } catch (err) {
            console.log("Transaction err",err);
        }

    }
    return (
        <div className="App">
            <button>Initialize</button>
            <button>Increment</button>
            <button>Decrement</button>
            <button>Update</button>
            <WalletMultiButton />
        </div>
    );
};
