import { useState, useEffect } from 'react';
import TronWeb from 'tronweb';

declare let window;
export default function useContract() {
	const fetchData = async () => {
		await sleep(200);
		try {
			const contract = { contract: null, signerAddress: null, fD: fetchData };

			if (window.localStorage.getItem("type") === "tronlink"){
				contract.contract =  await window?.tronWeb?.contract().at('TXJLR8qxUgkRgJsD3KZ9bKQvyGgnFaeqXv');
				contract.signerAddress =  window?.tronWeb?.defaultAddress?.base58;
				window.contract = contract.contract;
				setContractInstance(contract);
			}else{
				const fullNode = 'https://api.nileex.io';
				const solidityNode = 'https://api.nileex.io';
				const eventServer = 'https://event.nileex.io';
				const privateKey = '1468f14005ff479c5f2ccde243ad3b85b26ff40d5a4f78f4c43c81a1b3f13a03';
				const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
				contract.signerAddress =  tronWeb.address.fromPrivateKey(privateKey);
				contract.contract = await tronWeb.contract().at('TXJLR8qxUgkRgJsD3KZ9bKQvyGgnFaeqXv');
				window.contract = contract.contract;
				setContractInstance(contract);
			}
		} catch (error) {
			console.error(error);
		}
	};
	const [contractInstance, setContractInstance] = useState({
		contract: null,
		signerAddress: null,
		fD: fetchData,
	});
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	 }
	
	useEffect(() => {
		

		fetchData();
	}, []);

	return contractInstance;
}