import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import SearchByName from "./SearchByName";
import SearchByVIN from "./SearchByVIN";
import SearchByMakeAndYear from "./SearchByMakeAndYear";

const SearchTabs = () => {
  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={handleChange}
            aria-label="Different search options tabs"
            sx={{ "& .MuiTab-root": { textTransform: "none" } }}
          >
            <Tab label="By Name" value="1" />
            <Tab label="By VIN" value="2" />
            <Tab label="By Make & Year" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <SearchByName />
        </TabPanel>
        <TabPanel value="2">
          <SearchByVIN />
        </TabPanel>
        <TabPanel value="3">
          <SearchByMakeAndYear />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default SearchTabs;
