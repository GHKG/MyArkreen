import { Console } from 'console'
import { Contract } from 'ethers'
import { providers, utils, BigNumber, Signer, Wallet } from 'ethers'

import hre from 'hardhat'



//type hash
const EIP712DOMAIN_TYPEHASH = utils.keccak256(
    utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
)
export const PERMIT_TYPEHASH = utils.keccak256(
    utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)

const REWARD_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('Reward(address receiver,uint256 value,uint256 nonce)')
)

//zero address
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

//expand number
export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

export function expandToDecimals(n:number, m:number):BigNumber{
  return BigNumber.from(n).mul(BigNumber.from(10).pow(m))
}

export function toBigInt_18(numStr: string): BigInt|undefined{

  if(numStr.length === 0){
      return undefined
  }
  let indexOfPoint = numStr.indexOf('.')
  if(indexOfPoint === -1){
      return BigInt(numStr+'0'.repeat(18))
  }else{
      let lengthOfDecimal = numStr.length - indexOfPoint - 1
      if(lengthOfDecimal > 18){
          return undefined
      }
      let fullDecimal = numStr + "0".repeat(18-lengthOfDecimal)
      let retDecimal = fullDecimal.substring(0, indexOfPoint) + fullDecimal.substring(indexOfPoint+1)
      return BigInt(retDecimal)
  }

}



function getDomainSeparator(name: string, verson: string, contractAddress: string, chain_Id?: number | undefined) {
    
    const chainId = (chain_Id === undefined) ? hre.network.config.chainId : chain_Id
    //  console.log(`chainId is  ${chainId}`);
    //const chainId = 80001;

    return utils.keccak256(
      utils.defaultAbiCoder.encode(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
        [
          EIP712DOMAIN_TYPEHASH,
          utils.keccak256(utils.toUtf8Bytes(name)),
          utils.keccak256(utils.toUtf8Bytes(verson)),
          chainId,
          contractAddress
        ]
      )
    )
  }

export function getPermitDigest(
    owner: string,
    spender: string,
    value: BigNumber,
    nonce: BigNumber,
    deadline: BigNumber,
  
    contracAddress: string,
    domainName: string,
    version: string
  
): string {
    const DOMAIN_SEPARATOR = getDomainSeparator(domainName, version, contracAddress)
  
    //console.log("domain separator: " + DOMAIN_SEPARATOR)
    //console.log("permit type hash: " +  PERMIT_TYPEHASH)
  
    return utils.keccak256(
      utils.solidityPack(
        ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
        [
          '0x19',
          '0x01',
          DOMAIN_SEPARATOR,
          utils.keccak256(
            utils.defaultAbiCoder.encode(
              //'Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)'
              ['bytes32', 'address','address', 'uint256', 'uint256', 'uint256'],
              [PERMIT_TYPEHASH , owner, spender, value, nonce, deadline]
            )
          )
        ]
      )
    )
  
  }

  export function getWithdrawDigest(
    //sender: string,
    receiver: string,
    value: BigNumber,
    nonce: BigNumber,

    contractAddr: string,
    domainName: string,
    version: string
  
  ): string {
  
    const DOMAIN_SEPARATOR = getDomainSeparator(domainName,version, contractAddr)
  
    return utils.keccak256(
      utils.solidityPack(
        ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
        [
          '0x19',
          '0x01',
          DOMAIN_SEPARATOR,
          utils.keccak256(
            utils.defaultAbiCoder.encode(
              ['bytes32', 'address', 'uint256', 'uint256'],
              [REWARD_TYPEHASH , receiver, value, nonce]
            )
          )
        ]
      )
    )
  }