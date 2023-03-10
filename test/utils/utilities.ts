import { Console } from 'console'
import { Contract } from 'ethers'
import { providers, utils, BigNumber, Signer, Wallet } from 'ethers'

import hre from 'hardhat'

export const MINIMUM_LIQUIDITY = BigNumber.from(10).pow(3)

const PERMIT_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)

const MINER_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('MinerRegister(address owner,address[] miners,uint256 nonce,uint256 feeRegister,uint256 deadline)')
)

const REWARD_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('Reward(address receiver,uint256 value,uint256 nonce)')
)


export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

export function BigNumberPercent(n: BigNumber, ratio: number): BigNumber {
  return n.mul(BigNumber.from(ratio)).div(BigNumber.from(100))
}

export function RemoveOutPercent(n: BigNumber, ratio: number, Liquidity: BigNumber): BigNumber {
  return n.mul(BigNumber.from(ratio)).div(BigNumber.from(100)).mul(Liquidity.sub(MINIMUM_LIQUIDITY)).div(Liquidity)
}

export function RemoveLeftPercent(n: BigNumber, ratio: number, Liquidity: BigNumber): BigNumber {
  return n.mul(BigNumber.from(ratio)).div(BigNumber.from(100)).mul(MINIMUM_LIQUIDITY).div(Liquidity)
}

function getDomainSeparator(name: string, contractAddress: string) {
  const chainId = hre.network.config.chainId
  //const chainId = 80001;
// console.log(`chainId is  ${chainId}`);
  return utils.keccak256(
    utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        utils.keccak256(utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
        utils.keccak256(utils.toUtf8Bytes(name)),
        utils.keccak256(utils.toUtf8Bytes('1')),
        chainId,
        contractAddress
      ]
    )
  )
}

export const randomSigners = (amount: number): Signer[] => {
  const signers: Signer[] = []
  for (let i = 0; i < amount; i++) {
    signers.push(Wallet.createRandom())
  }
  return signers
}

export const randomAddresses = (amount: number): string[] => {
  const addresses: string[] = []
  for (let i = 0; i < amount; i++) {
    addresses.push(Wallet.createRandom().address)
  }
  return addresses
}

export enum MinerType {
  GameMiner,          // 0
  LiteMiner,          // 1
  StandardMiner,      // 2
  virtualMiner,       // 3
  APIMiner            // 4
}

export enum MinerStatus {
  Pending,            // 0
  Normal,             // 1
  Locked,             // 2
  Terminated          // 3
}

export function getCreate2Address(
  factoryAddress: string,
  [tokenA, tokenB]: [string, string],
  bytecode: string
): string {
  const [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]
  const create2Inputs = [
    '0xff',
    factoryAddress,
    utils.keccak256(utils.solidityPack(['address', 'address'], [token0, token1])),
    utils.keccak256(bytecode)
  ]
  const sanitizedInputs = `0x${create2Inputs.map(i => i.slice(2)).join('')}`
  return utils.getAddress(`0x${utils.keccak256(sanitizedInputs).slice(-40)}`)
}

export function getCreate2AddressFeSwap(
  factoryAddress: string,
  [tokenA, tokenB]: [string, string],
  bytecode: string
): string {
  const create2Inputs = [
    '0xff',
    factoryAddress,
    utils.keccak256(utils.solidityPack(['address', 'address'], [tokenA, tokenB])),
    utils.keccak256(bytecode)
  ]
  const sanitizedInputsAAB = `0x${create2Inputs.map(i => i.slice(2)).join('')}`
  return utils.getAddress(`0x${utils.keccak256(sanitizedInputsAAB).slice(-40)}`)
}

export async function getMinerRegisterDigest(
  contractName: string,
  contracAddress: string,
  approve: {
    owner: string
    miners: string[]
  },
  nonce: BigNumber,
  feeRegister: BigNumber,
  deadline: BigNumber
): Promise<string> {
  const DOMAIN_SEPARATOR = getDomainSeparator(contractName, contracAddress)

/*
  const dataToHash = utils.defaultAbiCoder.encode(
    ['bytes32', 'address', 'address[]', 'uint256', 'uint256', 'uint256'],
    [MINER_TYPEHASH, approve.owner, approve.miners, nonce, feeRegister, deadline]
  )
  console.log('dataToHash:',  dataToHash)
  console.log('HashOfData:',  utils.keccak256(dataToHash))
  console.log('DOMAIN_SEPARATOR:', DOMAIN_SEPARATOR)
*/
  return utils.keccak256(
    utils.solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        utils.keccak256(
          utils.defaultAbiCoder.encode(
            ['bytes32', 'address', 'address[]', 'uint256', 'uint256', 'uint256'],
            [MINER_TYPEHASH, approve.owner, approve.miners, nonce, feeRegister, deadline]
          )
        )
      ]
    )
  )
}


export function getOnboardingGameMinerDigest(
  contractName: string,
  contracAddress: string,
  approve: {
    owner: string
    miner: string
    bAirDrop: boolean
  },
  nonce: BigNumber,
  feeRegister: BigNumber,
  deadline: BigNumber
): string {
  const DOMAIN_SEPARATOR = getDomainSeparator(contractName, contracAddress)
  return utils.keccak256(
    utils.solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        utils.keccak256(
          utils.defaultAbiCoder.encode(
            ['bytes32', 'address', 'address', 'bool', 'uint256', 'uint256', 'uint256'],
            [MINER_TYPEHASH, approve.owner, approve.miner, approve.bAirDrop, nonce, feeRegister, deadline]
          )
        )
      ]
    )
  )
}

export function getOnboardingDTUMinerDigest(
  contractName: string,
  contracAddress: string,
  approve: {
    owner:      string
    gameMiner:  string
    miner:      string
    minerType:  number
  },
  nonce: BigNumber,
  feeRegister: BigNumber,
  deadline: BigNumber
): string {
  const DOMAIN_SEPARATOR = getDomainSeparator(contractName, contracAddress)
  return utils.keccak256(
    utils.solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        utils.keccak256(
          utils.defaultAbiCoder.encode(
            ['bytes32', 'address', 'address', 'address', 'uint8', 'uint256', 'uint256', 'uint256'],
            [MINER_TYPEHASH, approve.owner, approve.gameMiner, approve.miner, approve.minerType, nonce, feeRegister, deadline]
          )
        )
      ]
    )
  )
}


export async function getApprovalDigest(
  token: Contract,
  approve: {
    owner: string
    spender: string
    value: BigNumber
  },
  nonce: BigNumber,
  deadline: BigNumber
): Promise<string> {
  const name = await token.name()
  const DOMAIN_SEPARATOR = getDomainSeparator(name, token.address)
  return utils.keccak256(
    utils.solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        utils.keccak256(
          utils.defaultAbiCoder.encode(
            ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
            [PERMIT_TYPEHASH, approve.owner, approve.spender, approve.value, nonce, deadline]
          )
        )
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

): string {
  const DOMAIN_SEPARATOR = getDomainSeparator(domainName, contracAddress)

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
  domainName: string

): string {

  // console.log(`GET() receiver is ${receiver}`)
  // console.log(`GET() value is ${value}`)
  // console.log(`GET() nonce is ${nonce}`)
  // console.log(`GET() contractAddr is ${contractAddr}`)
  // console.log(`GET() domainName is ${domainName}`)

  const DOMAIN_SEPARATOR = getDomainSeparator(domainName, contractAddr)

  //console.log(`Domain separator is : ${DOMAIN_SEPARATOR}`);
  // console.log(`reward type hash is : ${REWARD_TYPEHASH}`);

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

export async function mineBlock(provider: providers.Web3Provider, timestamp: number): Promise<void> {
  return provider.send('evm_mine', [timestamp])
}

export function encodePrice(reserve0: BigNumber, reserve1: BigNumber) {
  return [reserve1.mul(BigNumber.from(2).pow(112)).div(reserve0), reserve0.mul(BigNumber.from(2).pow(112)).div(reserve1)]
}


export function  sqrt(y: BigNumber): BigNumber {
  let x: BigNumber
  let z: BigNumber
  
  if (y.gt(3)) {
    z = y;
    x = y.div(2).add(1);
    while (x.lt(z)) {
      z = x;
      x = y.div(x).add(x).div(2);
    }
  } else if (y.isZero()) {
    z = BigNumber.from(0);
  } else {
    z = BigNumber.from(1);
  }
  return z
}
  
/* 
  library Babylonian {
    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
        // else z = 0
    }
}
*/

