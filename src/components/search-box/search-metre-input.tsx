import React, {FC, useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import intersectionBy from 'lodash/intersectionBy';
import Select from 'react-select';
import {Label} from 'theme-ui';
import {useField} from 'formik';
import {useFindMetreQuery} from '../queries';

type SearchInput = {
  label: string;
  name: string;
};

const SearchInput: FC<SearchInput> = ({label, ...props}) => {
  const [field, , helpers] = useField(props);
  const [searchTerm, setSearchTerm] = useState('');
  const {loading, error, data, fetchMore} = useFindMetreQuery({
    variables: {metre: searchTerm}
  });
  const fetchMoreMetres = useCallback(() => {
    void fetchMore({
      variables: {
        skip: data?.metreMany.length
      },
      updateQuery: (previous, {fetchMoreResult}) => {
        if (!fetchMoreResult) return previous;
        return {
          ...previous,
          metreMany: [...previous.metreMany, ...fetchMoreResult.metreMany]
        };
      }
    });
  }, [data, fetchMore]);

  let options = [];

  if (error) {
    options = [];
  } else {
    options =
      data?.metreMany.map(({_id, metre}) => ({
        label: metre,
        value: _id
      })) ?? [];
  }

  let value = intersectionBy(options, field.value, 'value');

  if (value.length === 0) {
    value = field.value;
  }

  return (
    <Label sx={{flexDirection: 'column'}}>
      <span>{label}</span>
      <Select
        isMulti
        isClearable
        isSearchable
        isLoading={loading}
        value={value}
        inputValue={searchTerm}
        options={options}
        onChange={(value) => helpers.setValue(value)}
        onMenuScrollToBottom={fetchMoreMetres}
        onInputChange={(value) => setSearchTerm(value)}
      />
    </Label>
  );
};

SearchInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};

export default SearchInput;
