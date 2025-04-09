## Methods
| **Symbol** | **Meaning**                                                                              |
| :--------: | :--------------------------------------------------------------------------------------- |
|    **◯**   | Execution gas for this method does not include intrinsic gas overhead                    |
|    **△**   | Cost was non-zero but below the precision setting for the currency display (see options) |

|                                                  |     Min |     Max |     Avg | Calls | usd avg |
| :----------------------------------------------- | ------: | ------: | ------: | ----: | ------: |
| **contractSigningRejSBT**                        |         |         |         |       |         |
|        *mint*                                    | 234,361 | 251,461 | 238,636 |     8 |  0.3702 |
| **multiSigWalletContractSigning**                |         |         |         |       |         |
|        *confirmAndExecuteTransaction*            |       - |       - | 174,661 |     1 |  0.2709 |
|        *confirmTransaction*                      |  72,418 |  72,430 |  72,425 |     5 |  0.1123 |
|        *revokeConfirmation*                      |       - |       - |  35,402 |     1 |  0.0549 |
|        *submitTransactionWithSignerConfirmation* | 182,358 | 205,082 | 197,507 |     3 |  0.3064 |

## Deployments
|                                   | Min | Max  |       Avg | Block % | usd avg |
| :-------------------------------- | --: | ---: | --------: | ------: | ------: |
| **contractSigningRejSBT**         |   - |    - | 1,405,912 |   4.7 % |  2.1808 |
| **multiSigWalletContractSigning** |   - |    - | 1,253,779 |   4.2 % |  1.9449 |

## Solidity and Network Config
| **Settings**        | **Value**       |
| ------------------- | --------------- |
| Solidity: version   | 0.8.20          |
| Solidity: optimized | true            |
| Solidity: runs      | 200             |
| Solidity: viaIR     | false           |
| Block Limit         | 30,000,000      |
| L1 Gas Price        | 0.70104 gwei    |
| Token Price         | 2212.71 usd/eth |
| Network             | ETHEREUM        |
| Toolchain           | hardhat         |

