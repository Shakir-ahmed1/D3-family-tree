import { CustomFlatData, FamilyNode, HrDataChild, HrDataParent, Parent } from "./node.interface";
import * as d3 from 'd3';
interface Relations {
    spouses: number[],
    children: number[],
    father?: number;
    mother?: number;
}
interface CustomStructure {
    id: number;
    name: string;
    gender: string;
    // imageUrl: string;
    rels: Relations;
}
interface DrawableNode {
    id: number,
    name: string;
    gender: string;
    father?: number;
    mother?: number;
    target?: number;
    type: 'spouse' | 'child';
    children?: DrawableNode[]
}


export class NodeData {
    constructor() {

    }
    // private data: CustomFlatData = {
    //     familyNodes: [],
    //     parents: []
    // }
    private data: CustomFlatData ={
        "parents": [
          {
            "id": 1,
            "isSecondary": false,
            "createdAt": "2025-02-21T06:05:27.599Z",
            "updatedAt": "2025-02-21T06:05:27.599Z",
            "startedAt": null,
            "devorcedAt": null,
            "type": "MAIN",
            "femaleNode": {
              "id": 1,
              "isSecondary": false
            },
            "maleNode": {
              "id": 2,
              "isSecondary": false
            }
          },
          {
            "id": 2,
            "isSecondary": false,
            "createdAt": "2025-02-21T06:05:27.646Z",
            "updatedAt": "2025-02-21T06:05:27.646Z",
            "startedAt": null,
            "devorcedAt": null,
            "type": "MAIN",
            "femaleNode": {
              "id": 3,
              "isSecondary": false
            },
            "maleNode": {
              "id": 7,
              "isSecondary": false
            }
          },
          {
            "id": 3,
            "isSecondary": false,
            "createdAt": "2025-02-21T06:05:27.671Z",
            "updatedAt": "2025-02-21T06:05:27.671Z",
            "startedAt": null,
            "devorcedAt": null,
            "type": "MAIN",
            "femaleNode": null,
            "maleNode": {
              "id": 6,
              "isSecondary": false
            }
          },
          {
            "id": 4,
            "isSecondary": false,
            "createdAt": "2025-02-21T16:24:53.275Z",
            "updatedAt": "2025-02-21T16:24:53.275Z",
            "startedAt": null,
            "devorcedAt": null,
            "type": "UNKNOWN",
            "femaleNode": null,
            "maleNode": {
              "id": 8,
              "isSecondary": false
            }
          },
          {
            "id": 5,
            "isSecondary": false,
            "createdAt": "2025-02-21T16:24:58.430Z",
            "updatedAt": "2025-02-21T16:24:58.430Z",
            "startedAt": null,
            "devorcedAt": null,
            "type": "UNKNOWN",
            "femaleNode": null,
            "maleNode": {
              "id": 8,
              "isSecondary": false
            }
          },
          {
            "id": 6,
            "isSecondary": false,
            "createdAt": "2025-02-21T16:24:58.928Z",
            "updatedAt": "2025-02-21T16:24:58.928Z",
            "startedAt": null,
            "devorcedAt": null,
            "type": "UNKNOWN",
            "femaleNode": null,
            "maleNode": {
              "id": 8,
              "isSecondary": false
            }
          },
          {
            "id": 7,
            "isSecondary": false,
            "createdAt": "2025-02-21T16:38:15.285Z",
            "updatedAt": "2025-02-21T16:38:15.285Z",
            "startedAt": null,
            "devorcedAt": null,
            "type": "UNKNOWN",
            "femaleNode": {
              "id": 23,
              "isSecondary": false
            },
            "maleNode": {
              "id": 2,
              "isSecondary": false
            }
          },
          {
            "id": 8,
            "isSecondary": false,
            "createdAt": "2025-02-21T16:38:19.685Z",
            "updatedAt": "2025-02-21T16:38:19.685Z",
            "startedAt": null,
            "devorcedAt": null,
            "type": "UNKNOWN",
            "femaleNode": {
              "id": 24,
              "isSecondary": false
            },
            "maleNode": {
              "id": 2,
              "isSecondary": false
            }
          }
        ],
        "familyNodes": [
          {
            "id": 1,
            "generatedName": "",
            "name": "Foree",
            "title": null,
            "phone": null,
            "address": null,
            "gender": "FEMALE",
            "nickName": null,
            "birthDate": null,
            "deathDate": null,
            "createdAt": "2025-02-21T06:05:27.494Z",
            "updatedAt": "2025-02-21T06:05:27.494Z",
            "isSecondary": false,
            "isFounder": true,
            "parentRelationship": null,
            "ownedBy": null
          },
          {
            "id": 2,
            "generatedName": "",
            "name": "Prurururu",
            "title": null,
            "phone": null,
            "address": null,
            "gender": "MALE",
            "nickName": null,
            "birthDate": null,
            "deathDate": null,
            "createdAt": "2025-02-21T06:05:27.518Z",
            "updatedAt": "2025-02-21T06:05:27.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 3,
              "maleNode": {
                "id": 6,
                "name": "Zoro"
              },
              "femaleNode": null
            },
            "ownedBy": null
          },
          {
            "id": 3,
            "generatedName": "",
            "name": "Hyuu",
            "title": null,
            "phone": null,
            "address": null,
            "gender": "FEMALE",
            "nickName": null,
            "birthDate": null,
            "deathDate": null,
            "createdAt": "2025-02-21T06:05:27.545Z",
            "updatedAt": "2025-02-21T06:05:27.545Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": null,
            "ownedBy": null
          },
          {
            "id": 4,
            "generatedName": "",
            "name": "Nami",
            "title": null,
            "phone": null,
            "address": null,
            "gender": "FEMALE",
            "nickName": null,
            "birthDate": null,
            "deathDate": null,
            "createdAt": "2025-02-21T06:05:27.558Z",
            "updatedAt": "2025-02-21T06:05:27.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 2,
              "maleNode": {
                "id": 7,
                "name": "Name Surname"
              },
              "femaleNode": {
                "id": 3,
                "name": "Hyuu"
              }
            },
            "ownedBy": null
          },
          {
            "id": 5,
            "generatedName": "",
            "name": "Chopeor",
            "title": null,
            "phone": null,
            "address": null,
            "gender": "MALE",
            "nickName": null,
            "birthDate": null,
            "deathDate": null,
            "createdAt": "2025-02-21T06:05:27.568Z",
            "updatedAt": "2025-02-21T06:05:27.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 2,
              "maleNode": {
                "id": 7,
                "name": "Name Surname"
              },
              "femaleNode": {
                "id": 3,
                "name": "Hyuu"
              }
            },
            "ownedBy": null
          },
          {
            "id": 6,
            "generatedName": "",
            "name": "Zoro",
            "title": null,
            "phone": null,
            "address": null,
            "gender": "MALE",
            "nickName": null,
            "birthDate": null,
            "deathDate": null,
            "createdAt": "2025-02-21T06:05:27.583Z",
            "updatedAt": "2025-02-21T06:05:27.583Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": null,
            "ownedBy": null
          },
          {
            "id": 7,
            "generatedName": "",
            "name": "Name Surname",
            "title": null,
            "phone": null,
            "address": null,
            "gender": "MALE",
            "nickName": null,
            "birthDate": "1970-01-01T00:00:00.000Z",
            "deathDate": null,
            "createdAt": "2025-02-21T06:05:27.462Z",
            "updatedAt": "2025-02-21T06:05:27.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 8,
            "generatedName": "",
            "name": "Pru's brother",
            "title": null,
            "phone": null,
            "address": null,
            "gender": "MALE",
            "nickName": null,
            "birthDate": null,
            "deathDate": null,
            "createdAt": "2025-02-21T06:05:27.532Z",
            "updatedAt": "2025-02-21T06:05:27.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 3,
              "maleNode": {
                "id": 6,
                "name": "Zoro"
              },
              "femaleNode": null
            },
            "ownedBy": null
          },
          {
            "id": 9,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:24:07.261Z",
            "updatedAt": "2025-02-21T16:24:07.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 3,
              "maleNode": {
                "id": 6,
                "name": "Zoro"
              },
              "femaleNode": null
            },
            "ownedBy": null
          },
          {
            "id": 10,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:24:53.277Z",
            "updatedAt": "2025-02-21T16:24:53.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 4,
              "maleNode": {
                "id": 8,
                "name": "Pru's brother"
              },
              "femaleNode": null
            },
            "ownedBy": null
          },
          {
            "id": 11,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:24:58.432Z",
            "updatedAt": "2025-02-21T16:24:58.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 5,
              "maleNode": {
                "id": 8,
                "name": "Pru's brother"
              },
              "femaleNode": null
            },
            "ownedBy": null
          },
          {
            "id": 12,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:24:58.930Z",
            "updatedAt": "2025-02-21T16:24:58.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 6,
              "maleNode": {
                "id": 8,
                "name": "Pru's brother"
              },
              "femaleNode": null
            },
            "ownedBy": null
          },
          {
            "id": 13,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:36:48.699Z",
            "updatedAt": "2025-02-21T16:36:48.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 14,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:36:53.862Z",
            "updatedAt": "2025-02-21T16:36:53.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 15,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:36:54.506Z",
            "updatedAt": "2025-02-21T16:36:54.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 16,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:36:55.097Z",
            "updatedAt": "2025-02-21T16:36:55.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 17,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:36:55.593Z",
            "updatedAt": "2025-02-21T16:36:55.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 18,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:36:56.089Z",
            "updatedAt": "2025-02-21T16:36:56.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 19,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:36:56.497Z",
            "updatedAt": "2025-02-21T16:36:56.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 20,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:36:56.937Z",
            "updatedAt": "2025-02-21T16:36:56.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 21,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:36:57.351Z",
            "updatedAt": "2025-02-21T16:36:57.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 22,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "MALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:36:57.729Z",
            "updatedAt": "2025-02-21T16:36:57.000Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": {
              "id": 1,
              "maleNode": {
                "id": 2,
                "name": "Prurururu"
              },
              "femaleNode": {
                "id": 1,
                "name": "Foree"
              }
            },
            "ownedBy": null
          },
          {
            "id": 23,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "FEMALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:38:15.279Z",
            "updatedAt": "2025-02-21T16:38:15.279Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": null,
            "ownedBy": null
          },
          {
            "id": 24,
            "generatedName": "",
            "name": "John Doe",
            "title": "Dr.",
            "phone": "123-456-7890",
            "address": "123 Main Street",
            "gender": "FEMALE",
            "nickName": "Johnny",
            "birthDate": "1990-01-01T00:00:00.000Z",
            "deathDate": "2090-01-01T00:00:00.000Z",
            "createdAt": "2025-02-21T16:38:19.670Z",
            "updatedAt": "2025-02-21T16:38:19.670Z",
            "isSecondary": false,
            "isFounder": false,
            "parentRelationship": null,
            "ownedBy": null
          }
        ]
      }
    getNode(id: number): FamilyNode {
        console.log("NODE ID", id)
        const foundNode = this.data.familyNodes.find(item => id === item.id)
        if (!foundNode) throw Error(`node with id ${id} was not found`)
        return foundNode;
    }

    getParentRelationship(id: number): Parent {
        const foundParentship = this.data.parents.find(item => id === item.id)
        if (!foundParentship) throw Error(`parentship with id ${id} was not found`)
        return foundParentship;
    }
    getSpouseRelationship(familyNode: FamilyNode) {
        return this.data.parents.filter(item => {
            if (familyNode.gender === "MALE" && item.maleNode) {
                return item.maleNode.id === familyNode.id
            } else if (familyNode.gender === "FEMALE" && item.femaleNode) {
                return item.femaleNode.id === familyNode.id
            }
        })
    }
    getSpouses(familyNode: FamilyNode) {
        const foundParentHood = this.data.parents.filter(item => {
            if (familyNode.gender === "MALE" && item.maleNode) {
                return item.maleNode.id === familyNode.id
            } else if (familyNode.gender === "FEMALE" && item.femaleNode) {
                return item.femaleNode.id === familyNode.id
            }
        })
        console.log("found parent hood", foundParentHood)
        return foundParentHood.map(item => {
            if (familyNode.gender === "MALE" && item.femaleNode) {
                return item.femaleNode.id
            } else if (familyNode.gender === "FEMALE" && item.maleNode) {
                return item.maleNode.id
            }
        })
    }
    customGetSpouses(familyNode: FamilyNode): DrawableNode[] {
        const foundParentHood = this.data.parents.filter(item => {
            if (familyNode.gender === "MALE" && item.maleNode) {
                return item.maleNode.id === familyNode.id
            } else if (familyNode.gender === "FEMALE" && item.femaleNode) {
                return item.femaleNode.id === familyNode.id
            }
        })
        const spouses = foundParentHood.map(item => {
            if (familyNode.gender === "MALE" && item.femaleNode) {
                return this.getNode(item.femaleNode.id)
            } else if (familyNode.gender === "FEMALE" && item.maleNode) {
                return this.getNode(item.maleNode.id)
            }
        }).filter(item => item)
        const newSpouses: DrawableNode[] = []
        for (let s of spouses) {
            const newSpouse: DrawableNode = {
                id: s.id,
                name: s.name,
                gender: s.gender,
                type: 'spouse',
                target: familyNode.id,
                children: [],
            }
            newSpouses.push(newSpouse)
        }
        console.log("all children", newSpouses)

        return newSpouses;
    }
    getChildren(id: number): number[] {
        const foundNode = this.getNode(id)
        const foundSpouseRelations = this.getSpouseRelationship(foundNode)
        const foundSpouseRelationsIds = foundSpouseRelations.map(item => item.id)
        const foundChildren = this.data.familyNodes.filter(item => {
            if (item.parentRelationship && foundSpouseRelationsIds.includes(item.parentRelationship.id)) {
                return true
            } else {
                return false
            }
        })
        return foundChildren.map(item => item.id)

    }
    customGetChildren(id: number): DrawableNode[] {
        const foundNode = this.getNode(id)
        const foundSpouseRelations = this.getSpouseRelationship(foundNode)
        const foundSpouseRelationsIds = foundSpouseRelations.map(item => item.id)
        const foundChildren = this.data.familyNodes.filter(item => {
            if (item.parentRelationship && foundSpouseRelationsIds.includes(item.parentRelationship.id)) {
                return true
            } else {
                return false
            }
        })
        const allChildren: DrawableNode[] = []
        foundChildren.map(item => {
            const customChild: DrawableNode = {
                id: item.id,
                name: item.name,
                gender: item.gender,
                type: 'child',
            }
            allChildren.push(customChild)
            const foundSpouses = this.customGetSpouses(item)
            allChildren.push(...foundSpouses)
        })
        return allChildren;

    }


    getParents(startNodeId: number) {
        const foundNode = this.getNode(startNodeId);
        const parents = []
        if (foundNode.parentRelationship) {
            const foundParentship = this.getParentRelationship(foundNode.parentRelationship.id)
            if (foundParentship.femaleNode) {
                const mother = this.getNode(foundParentship.femaleNode.id)
                parents.push(mother)
            }
            if (foundParentship.maleNode) {
                const father = this.getNode(foundParentship.maleNode.id)
                parents.push(father)
            }
        }
        return parents;
    }


    BuildDescendantsHiararchy(startNodeId: number): HrDataChild {
        const foundNode = this.getNode(startNodeId)
        // Create a map of all nodes by ID
        const allChildren = this.getChildren(startNodeId);
        const children: HrDataChild[] = allChildren.map(item => {
            const childDescendants: HrDataChild = this.BuildDescendantsHiararchy(item)
            return childDescendants
        })
        const resultedChildren: HrDataChild = {
            id: startNodeId,
            children
        }
        return resultedChildren;
    }


    BuildAncestorsHierarchy(startNodeId: number): HrDataParent {
        console.log(startNodeId)
        const foundNode = this.getNode(startNodeId)
        // Create a map of all nodes by ID
        const allParents = this.getParents(startNodeId).map(item => item.id)
        console.log("parents", allParents)
        const operatedParents = allParents.map(item => {
            return this.BuildAncestorsHierarchy(item)
        })
        const hrParent: HrDataParent = {
            id: startNodeId,
            parents: operatedParents
            // children: operatedParents
        }
        return hrParent
    }
    customBuildDescendantsHiararchy(startNodeId: number): DrawableNode {
        const foundNode = this.getNode(startNodeId)
        // Create a map of all nodes by ID
        const allChildren: DrawableNode[] = this.customGetChildren(startNodeId);
        const children: DrawableNode[] = allChildren
            .map(item => {
                if (item.type === 'spouse') {
                    return item;
                } else {
                    const childDescendants: DrawableNode = this.customBuildDescendantsHiararchy(item.id)
                    return childDescendants
                }
            })
        let father, mother;
        if (foundNode.parentRelationship) {
            const foundParentHood = this.getParentRelationship(foundNode.parentRelationship.id)
            if (foundParentHood.femaleNode) {
                mother = foundParentHood.femaleNode.id
            }
            if (foundParentHood.maleNode) {
                father = foundParentHood.maleNode.id
            }
        }
        console.log("namemememe", foundNode.name, foundNode.parentRelationship)
        const resultedChildren: DrawableNode = {
            id: startNodeId,
            name: foundNode.name,
            gender: foundNode.gender,
            type: "child",
            father,
            mother,
            children
        }
        return resultedChildren;
    }


    customBuildAncestorsHierarchy(startNodeId: number): HrDataParent {
        console.log(startNodeId)
        // Create a map of all nodes by ID
        const allParents = this.getParents(startNodeId).map(item => item.id)
        console.log("parents", allParents)
        const operatedParents = allParents.map(item => {
            return this.customBuildAncestorsHierarchy(item)
        })
        const hrParent: HrDataParent = {
            id: startNodeId,
            parents: operatedParents
            // children: operatedParents
        }
        return hrParent
    }


}

const ND = new NodeData()
// console.log("new Nodes", ND.convertNodeData())
export const treeDatazy = ND.customBuildDescendantsHiararchy(6);
console.log("new Nodeszy", treeDatazy)

// Now pass it to d3.hierarchy()
// const treeDataz = buildAncestorsHierarchy(flatData, 4);



