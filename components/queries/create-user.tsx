import gql from 'graphql-tag';

export default gql`
  mutation createUser(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    createUser(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
      confirmPassword: $confirmPassword
    ) {
      _id
      hasPaidAccount
      hasFreeAccount
      picture
      name {
        first
        last
      }
    }
  }
`;