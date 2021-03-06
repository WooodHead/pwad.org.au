import React, {FC, useCallback} from 'react';
import {useRouter} from 'next/router';
import isEmpty from 'lodash/isEmpty';
import {Styled, Box, Flex, Button} from 'theme-ui';
import {Formik, Form, Field} from 'formik';
import {TextField} from '../form';
import {usePrayerSearchLazyQuery, PrayerSearchQueryVariables} from '../queries';
import Loading from '../loading';
import ServerError from '../server-error';
import SearchResult, {isSearchResult} from './search-result';
import SearchOccasionInput from './search-occasion-input';
import SearchKeywordInput from './search-keyword-input';
import initialSelectValue from './initial-select-value';
import {prefetchOnePrayer} from '../../prefetch';

type SearchFields = {
  title?: string;
  occasion?: {
    value: string;
  };
  keyword?: {
    value: string;
  };
};

const SearchBox: FC = () => {
  const router = useRouter();

  const [search, {loading, error, data, client}] = usePrayerSearchLazyQuery();

  const handleSubmit = useCallback(
    ({occasion, keyword, title}: SearchFields) => {
      const variables: PrayerSearchQueryVariables = {title};

      if (occasion) {
        variables.occasion = occasion.value;
      }

      if (keyword) {
        variables.keyword = keyword.value;
      }

      search({variables});
    },
    [search]
  );

  const handleListAll = useCallback(() => {
    search({variables: {title: ''}});
  }, [search]);

  const showSearchResults = !isEmpty(router.query);
  let initialValues: SearchFields = {
    title: '',
    occasion: null,
    keyword: null
  };

  if (showSearchResults) {
    initialValues = {
      ...router.query,
      occasion: initialSelectValue(router.query.occasion).shift(),
      keyword: initialSelectValue(router.query.keyword).shift()
    };
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onReset={handleListAll}
      >
        <Form>
          <Flex>
            <Box grow={1} sx={{flexDirection: ['column', 'row'], width: '50%'}}>
              <Box marginBottom="1em">
                <TextField label="Title" name="title" />
              </Box>
              <Box marginBottom="1em">
                <Field
                  as={SearchOccasionInput}
                  label="Occasion"
                  name="occasion"
                />
              </Box>
              <Box marginBottom="1em">
                <Field as={SearchKeywordInput} label="Keyword" name="keyword" />
              </Box>
              <Box marginBottom="1em">
                <Button type="submit" sx={{width: '100%'}}>
                  Search
                </Button>
              </Box>
              <Box marginBottom="1em">
                <Button type="reset" sx={{width: '100%'}}>
                  List all
                </Button>
              </Box>
            </Box>
          </Flex>
        </Form>
      </Formik>
      {loading && <Loading />}
      {error && <ServerError error={error} />}
      {data?.prayerSearch?.length === 0 && (
        <Styled.p variant="prose">No results found...</Styled.p>
      )}
      {data?.prayerSearch?.length > 0 && (
        <>
          {data.prayerSearch.map((result) => {
            if (isSearchResult(result)) {
              return (
                <SearchResult
                  {...result}
                  key={result._id}
                  prefetch={() =>
                    prefetchOnePrayer(client, {
                      id: result._id
                    })
                  }
                />
              );
            }

            return null;
          })}
        </>
      )}
    </>
  );
};

export default SearchBox;
