// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
// import '@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol';
// import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';


contract ArkreenNotaryU2 is 
    UUPSUpgradeable,
    OwnableUpgradeable
{
    uint256 public updateCount;

    string  public blockHash;
    string  public cid;
    uint256 public blockHeight;
    uint256 public totalPowerGeneraton;
    uint256 public circulatingSupply;

    uint256 public newField;
    
    //events
    event DataSaved(string indexed blockHash, string indexed cid, uint256 blockHeight, uint256 totalPowerGeneraton, uint256 circulatingSupply);
    event DataSaved2(string indexed blockHash, string indexed cid, uint256 blockHeight, uint256 totalPowerGeneraton, uint256 circulatingSupply, uint256 newField);
    function initialize()
        external
        virtual
        initializer
    {
        __UUPSUpgradeable_init();
        __Ownable_init_unchained();
    }

    function saveData(
        string calldata blockHash_,
        string calldata cid_,
        uint256 blockHeight_,
        uint256 totalPowerGeneraton_,
        uint256 circulatingSupply_,
        uint256 newField_
    ) 
        public onlyOwner
    {
        //require(blockHash != _blockHash, "block hash repeat!");
        require(blockHeight_ >= blockHeight, "blockHeight data must increase!");
        require(totalPowerGeneraton_ >= totalPowerGeneraton, "totalPowerGeneraton data must increase!");
        require(circulatingSupply_ >= circulatingSupply, "circulatingSupply data must increase!");

        blockHash          = blockHash_;
        cid                = cid_;
        blockHeight        = blockHeight_;
        totalPowerGeneraton = totalPowerGeneraton_;
        circulatingSupply  = circulatingSupply_;

        newField           = newField_;

        updateCount += 1;

        emit DataSaved(blockHash, cid, blockHeight, totalPowerGeneraton, circulatingSupply);
        emit DataSaved2(blockHash, cid, blockHeight, totalPowerGeneraton, circulatingSupply, newField);
    }


    function _authorizeUpgrade(address newImplementation)
        internal
        virtual
        override
        onlyOwner
    {}
}