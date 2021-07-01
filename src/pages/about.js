/* eslint-disable shopify/jsx-no-hardcoded-content */
/* eslint-disable react/react-in-jsx-scope */
import { Heading, Page } from '@shopify/polaris';

const About = () => {
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
      <Heading>This is About Hello World</Heading>
    </Page>
  );
};

export default About;
