
import TronWeb from 'tronweb';

	// //Mainnet
	// const fullNode = 'https://api.trongrid.io';
	// const solidityNode = 'https://api.trongrid.io';
	// const eventServer = 'https://api.trongrid.io';

	//Nile
	const fullNode = 'https://api.nileex.io';
	const solidityNode = 'https://api.nileex.io';
	const eventServer = 'https://event.nileex.io';

	//Shasta
	// const fullNode = 'https://api.shasta.trongrid.io';
	// const solidityNode = 'https://api.shasta.trongrid.io';
	// const eventServer = 'https://api.shasta.trongrid.io';


	const privateKey = '1468f14005ff479c5f2ccde243ad3b85b26ff40d5a4f78f4c43c81a1b3f13a03';
	const contractAdd = 'TXJLR8qxUgkRgJsD3KZ9bKQvyGgnFaeqXv';
export default async function useContract() {
	
	let contractInstance = {
		contract: null,
		signerAddress: null
	}
	const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
	contractInstance.signerAddress =  tronWeb.address.fromPrivateKey(privateKey);
	contractInstance.contract = await tronWeb.contract().at(contractAdd);

	return contractInstance;
}
export async function getContractFromKey(privateKey){
	
	const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
	return  await tronWeb.contract().at(contractAdd);
}

export function base64DecodeUnicode(base64String) {
	return Buffer.from(base64String, "base64").toString('utf8');
}
