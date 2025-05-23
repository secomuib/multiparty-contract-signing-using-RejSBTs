## Methods
| **Symbol** | **Meaning**                                                                              |
| :--------: | :--------------------------------------------------------------------------------------- |
|    **◯**   | Execution gas for this method does not include intrinsic gas overhead                    |
|    **△**   | Cost was non-zero but below the precision setting for the currency display (see options) |

|                                              |     Min |     Max |     Avg | Calls | usd avg |
| :------------------------------------------- | ------: | ------: | ------: | ----: | ------: |
| **contractSigningRejSBT**                    |         |         |         |       |         |
|        *mint*                                | 211,978 | 229,078 | 217,678 |     6 |  0.5781 |
| **multiSigWalletContractSigning**            |         |         |         |       |         |
|        *approveAndExecuteTransaction*        |       - |       - | 173,271 |     1 |  0.4602 |
|        *approveTransaction*                  |       - |       - |  69,478 |     1 |  0.1845 |
|        *submitTransactionWithSignerApproval* | 163,180 | 203,004 | 183,092 |     2 |  0.4863 |

## Deployments
|                                   | Min | Max  |       Avg | Block % | usd avg |
| :-------------------------------- | --: | ---: | --------: | ------: | ------: |
| **contractSigningRejSBT**         |   - |    - | 1,293,381 |   4.3 % |  3.4351 |
| **multiSigWalletContractSigning** |   - |    - | 1,191,711 |     4 % |  3.1650 |

## Solidity and Network Config
| **Settings**        | **Value**       |
| ------------------- | --------------- |
| Solidity: version   | 0.8.20          |
| Solidity: optimized | true            |
| Solidity: runs      | 200             |
| Solidity: viaIR     | false           |
| Block Limit         | 30,000,000      |
| L1 Gas Price        | 1 gwei          |
| Token Price         | 2655.87 usd/eth |
| Network             | ETHEREUM        |
| Toolchain           | hardhat         |

