import { createAppSlice } from "./createAppSlice";
import { createSelector, type PayloadAction } from "@reduxjs/toolkit";

import { searchResultLimit } from "./constants";
import * as dv from "./util/dataview";
import { selectDataviewTasks } from "./globalSlice";

interface SearchSliceState {
  query: string;
}

const initialState: SearchSliceState = {
  query: "",
};

export const searchSlice = createAppSlice({
  name: "search",
  initialState,
  reducers: (create) => ({
    queryUpdated: create.reducer((state, action: PayloadAction<string>) => {
      state.query = action.payload;
    }),
  }),
  selectors: {
    selectQuery: (state) => state.query,
  },
});

export const { selectQuery } = searchSlice.selectors;
export const { queryUpdated } = searchSlice.actions;

const selectSearchResult = createSelector(
  selectQuery,
  selectDataviewTasks,
  (query, result) => {
    if (query.trim().length === 0) {
      return [];
    }

    return result.filter((task) => task.text.toLowerCase().includes(query));
  },
);

export const selectSearchDescription = createSelector(
  selectQuery,
  selectSearchResult,
  (query, result) => {
    if (query.trim().length === 0) {
      return "Type to search";
    }

    if (result.length === 0) {
      return "No matches";
    }

    if (result.length > searchResultLimit) {
      return `Limited to ${searchResultLimit} entries. Try refining your search.`;
    }

    return `${result.length} matches`;
  },
);

export const selectLimitedSearchResult = createSelector(
  selectSearchResult,
  (searchResult) => {
    return (
      searchResult
        .slice(0, searchResultLimit)
        // todo: remove moment
        .map((task) => dv.toUnscheduledTask(task, window.moment()))
    );
  },
);
