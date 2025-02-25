export const requestActions = [
    {
        "actionTitle": "SIBLING: Add a new sibling to the family tree",
        "uri": "/api/sibling-relationship/family-tree/},{familyTreeId}/relations/sibling/NewSibling",
        "requestBody": `
{
  "selfNodeId": 1,
  "otherNodeData": {
    "name": "John Doe",
    "gender": "MALE",
    "title": "Dr.",
    "phone": "123-456-7890",
    "address": "123 Main Street",
    "nickName": "Johnny",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "deathDate": "2090-01-01T00:00:00.000Z",
    "ownedById": 1
  }
}
`
    },
    {
        "actionTitle": "PARENT: Add a new biological parent to the node",
        "uri": "/api/family-tree/},{familyTreeId}/relations/parent/NewBiologicalParent",
        "requestBody": `
{
  "selfNodeId": 1,
  "parentNode1Data": {
    "name": "John Doe",
    "gender": "MALE",
    "title": "Dr.",
    "phone": "123-456-7890",
    "address": "123 Main Street",
    "nickName": "Johnny",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "deathDate": "2090-01-01T00:00:00.000Z",
    "ownedById": 1
  },
  "parentNode2Data": {
    "name": "John Doe",
    "gender": "MALE",
    "title": "Dr.",
    "phone": "123-456-7890",
    "address": "123 Main Street",
    "nickName": "Johnny",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "deathDate": "2090-01-01T00:00:00.000Z",
    "ownedById": 1
  },
  "partnershipType": "MAIN"
}
`
    },
    {
        "actionTitle": "CHILD: Create a child with an existing partner",
        "uri": "/api/child-relationship/family-tree/},{familyTreeId}/relations/child/WithExistingPartner",
        "requestBody": `
{
  "selfNodeId": 1,
  "partnerNodeId": 1,
  "childNodeData": {
    "name": "John Doe",
    "gender": "MALE",
    "title": "Dr.",
    "phone": "123-456-7890",
    "address": "123 Main Street",
    "nickName": "Johnny",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "deathDate": "2090-01-01T00:00:00.000Z",
    "ownedById": 1
  },
  "partnershipType": "MAIN"
}
`
    },
    {
        "actionTitle": "CHILD: Create a child without a partner",
        "uri": "/api/child-relationship/family-tree/},{familyTreeId}/relations/child/WithOutPartner",
        "requestBody": `
{
  "selfNodeId": 1,
  "childNodeData": {
    "name": "John Doe",
    "gender": "MALE",
    "title": "Dr.",
    "phone": "123-456-7890",
    "address": "123 Main Street",
    "nickName": "Johnny",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "deathDate": "2090-01-01T00:00:00.000Z",
    "ownedById": 1
  }
}
`
    },
    {
        "actionTitle": "CHILD: Create a child with a new partner",
        "uri": "/api/child-relationship/family-tree/},{familyTreeId}/relations/child/WithNewPartner",
        "requestBody": `
{
  "selfNodeId": 1,
  "childNodeData": {
    "name": "John Doe",
    "gender": "MALE",
    "title": "Dr.",
    "phone": "123-456-7890",
    "address": "123 Main Street",
    "nickName": "Johnny",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "deathDate": "2090-01-01T00:00:00.000Z",
    "ownedById": 1
  },
  "partnerNodeData": {
    "name": "John Doe",
    "gender": "MALE",
    "title": "Dr.",
    "phone": "123-456-7890",
    "address": "123 Main Street",
    "nickName": "Johnny",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "deathDate": "2090-01-01T00:00:00.000Z",
    "ownedById": 1
  },
  "partnershipType": "MAIN"
}
`
    },
    {
        "actionTitle": "SPOUSE: Add a new partner to the family tree",
        "uri": "/api/spouse-relationship/family-tree/},{familyTreeId}/relations/spouse/NewPartner",
        "requestBody": `
{
  "selfNodeId": 1,
  "otherNodeData": {
    "name": "John Doe",
    "gender": "MALE",
    "title": "Dr.",
    "phone": "123-456-7890",
    "address": "123 Main Street",
    "nickName": "Johnny",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "deathDate": "2090-01-01T00:00:00.000Z",
    "ownedById": 1
  },
  "partnershipType": "MAIN"
}
`
    },
    {
        "actionTitle": "SPOUSE: Add an existing partner to the family tree",
        "uri": "/api/spouse-relationship/family-tree/},{familyTreeId}/relations/spouse/ExistingPartner",
        "requestBody": `
{
  "selfNodeId": 1,
  "otherNodeId": 1,
  "partnershipType": "MAIN"
}
`
    }]