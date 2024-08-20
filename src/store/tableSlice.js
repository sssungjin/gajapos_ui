import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  saleType: "retail",
};

export const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setTableData: (state, action) => {
      state.data = action.payload;
    },
    updateItem: (state, action) => {
      const index = state.data.findIndex(
        (item) => item.uuid === action.payload.uuid
      );
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    deleteItem: (state, action) => {
      state.data = state.data.filter((item) => item.uuid !== action.payload);
    },
    setSaleType: (state, action) => {
      state.saleType = action.payload;
    },
  },
});

export const { setTableData, updateItem, deleteItem, setSaleType } =
  tableSlice.actions;

export default tableSlice.reducer;
