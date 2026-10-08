import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import SearchByName from "./SearchByName";

// Set to true when the "By Make & Year" tab comes back
const showTabStrip = false;

const SearchTabs = () => {
  const [value, setValue] = React.useState("1");

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        {/* Hidden while "By Name" is the only search option */}
        {showTabStrip && (
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList
              onChange={handleChange}
              aria-label="Different search options tabs"
              sx={{ "& .MuiTab-root": { paddingY: "20px" } }}
            >
              <Tab label="By Name" value="1" />
              {/* <Tab label="By Make & Year" value="2" /> */}
            </TabList>
          </Box>
        )}
        <TabPanel value="1" sx={{ p: 0 }}>
          <SearchByName />
        </TabPanel>
        {/* <TabPanel value="2">
          <SearchByMakeAndYear />
        </TabPanel> */}
      </TabContext>
    </Box>
  );
};

export default SearchTabs;
