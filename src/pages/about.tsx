import { gql, useQuery } from '@apollo/client';
import { Heading, Page } from '@shopify/polaris';

const GET_COLLECTIONS = gql`
  query getCollections($first: Int) {
    collections(first: $first) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

const About = (): JSX.Element => {
  const { data: dataWithCollections } = useQuery(GET_COLLECTIONS, {
    variables: {
      first: 50,
    },
  });

  console.log('dataWithCollections: ', dataWithCollections);

  return (
    <Page>
      <Heading>This is About Hello World</Heading>
    </Page>
  );
};

export default About;
