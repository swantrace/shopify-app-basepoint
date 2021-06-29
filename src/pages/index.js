import { gql, useQuery } from "@apollo/client";
import { Heading, Page } from "@shopify/polaris";

// const GET_COLLECTIONS = gql`
//   query getCollections {
//     collections(first: 50) {
//       edges {
//         cursor
//         node {
//           id
//           title
//           image {
//             altText
//             originalSrc
//           }
//           metafield(namespace: "dtm", key: "info") {
//             id
//             key
//             legacyResourceId
//             namespace
//             value
//             valueType
//             ownerType
//           }
//         }
//       }
//       pageInfo {
//         hasNextPage
//         hasPreviousPage
//       }
//     }
//   }
// `;

const Index = () => {
  // const { loading, data: dataWithCollections, fetchMore } = useQuery(
  //   GET_COLLECTIONS,
  //   {
  //     variables: {
  //       first: 50,
  //     },
  //   }
  // );

  // console.log("dataWithCollections: ", dataWithCollections);
  return (
    <Page>
      <Heading>Shopify app with Node and React 🎉</Heading>
    </Page>
  );
};

export default Index;
