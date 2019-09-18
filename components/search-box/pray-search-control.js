import React, {useReducer} from 'react';
import PropTypes from 'prop-types';
import identity from 'lodash/identity';
import pickBy from 'lodash/pickBy';
import {useQuery} from '@apollo/react-hooks';
import Box from 'mineral-ui/Box';
import Flex, {FlexItem} from 'mineral-ui/Flex';
import Text from 'mineral-ui/Text';
import Button from 'mineral-ui/Button';
import TextInput from 'mineral-ui/TextInput';
import {useMediumMedia} from '../use-media';
import {Formik, Form, FormField} from '../form';
import {ADVANCED_SEARCH} from '../queries';
import SearchResult from './search-result';
import SearchMetreInput from './search-metre-input';
import SearchTuneInput from './search-tune-input';
import SearchPassageInput from './search-passage-input';
import SearchOccasionInput from './search-occasion-input';
import SearchKeywordInput from './search-keyword-input';

const initialState = {
  showSearchResults: false,
  showHowToSearch: false,
  showAdvancedSeach: false
};

function reducer(state, action) {
  let keywords;
  let tunes;
  let book;
  let occasion;

  switch (action.type) {
    case 'search':
      if (action.fields.hymnMetres && action.fields.hymnMetres.length > 0) {
        tunes = action.fields.hymnMetres.flatMap(({tunes}) => tunes);
      }

      if (action.fields.passage) {
        book = action.fields.passage.value;
      }

      if (action.fields.occasion) {
        occasion = action.fields.occasion.value;
      }

      if (action.fields.tune) {
        if (tunes) {
          tunes.push(action.fields.tune.value);
        } else {
          tunes = [action.fields.tune.value];
        }
      }

      if (action.fields.keyword) {
        keywords = [action.fields.keyword.value];
      }

      return {
        ...state,
        ...pickBy(
          {
            ...action.fields,
            occasion,
            book,
            tunes,
            keywords
          },
          identity
        ),
        showSearchResults: true
      };
    default:
      throw new Error(`Action type ${action.type} does not exist`);
  }
}

function AdvancedSearch({search}) {
  const {
    loading,
    error,
    data: {hymnMany, prayerMany, liturgyMany}
  } = useQuery(ADVANCED_SEARCH, {
    variables: search
  });

  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return `Error! ${error.message}`;
  }

  const results = [...hymnMany, ...prayerMany, ...liturgyMany].sort(
    (a, b) => b.score - a.score
  );

  if (results.length > 0) {
    return results.map(result => <SearchResult key={result._id} {...result} />);
  }

  return <Text appearance="prose">No results found...</Text>;
}

AdvancedSearch.propTypes = {
  search: PropTypes.object.isRequired
};

function SearchBox() {
  const isMedium = useMediumMedia();
  const [state, dispatch] = useReducer(reducer, initialState);

  const {showSearchResults, ...search} = state;

  return (
    <>
      <Formik
        initialValues={{
          hymnMetres: [],
          search: '',
          title: '',
          occasion: '',
          keyword: '',
          tune: null,
          passage: null
        }}
        onSubmit={fields => dispatch({type: 'search', fields})}
      >
        <Form>
          <Flex>
            <FlexItem
              grow={1}
              width="50%"
              breakpoints={['medium']}
              direction={['column', 'row']}
            >
              <Box marginBottom="1em">
                <FormField input={TextInput} label="Title" name="title" />
              </Box>
              <Box marginBottom="1em">
                <FormField
                  input={SearchMetreInput}
                  label="Hymn Metre"
                  name="hymnMetres"
                />
              </Box>
              <Box marginBottom="1em">
                <FormField input={SearchTuneInput} label="Tune" name="tune" />
              </Box>
              <Box marginBottom="1em">
                <FormField
                  input={SearchPassageInput}
                  label="Passage"
                  name="passage"
                />
              </Box>
              <Box marginBottom="1em">
                <FormField
                  input={SearchOccasionInput}
                  label="Occasion"
                  name="occasion"
                />
              </Box>
              <Box marginBottom="1em">
                <FormField
                  input={SearchKeywordInput}
                  label="Keyword"
                  name="keyword"
                />
              </Box>
              <Box marginBottom="1em">
                <Button fullWidth type="submit">
                  Search
                </Button>
              </Box>
            </FlexItem>
            {isMedium && (
              <FlexItem grow={1} width="50%">
                <Text>
                  Search Instructions to help people to search. Lorem ipsum
                  dolor sit amet, affert theophrastus in sea, at aeterno
                  invidunt platonem has. Habeo inimicus rationibus mel ex, nisl
                  fabellas nec ei, quo et quot putant legendos. Prompta
                  definitiones nam an, quidam scaevola per te. Eum at purto
                  vocibus mnesarchum, diam falli an nam. Dicunt perfecto
                  deserunt mel in, mundi moderatius eu eam.
                </Text>
              </FlexItem>
            )}
          </Flex>
        </Form>
      </Formik>
      {showSearchResults && <AdvancedSearch search={search} />}
    </>
  );
}

export default SearchBox;