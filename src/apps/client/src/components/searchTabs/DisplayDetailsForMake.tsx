import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import ChatDrawer from "../../ai-chat/ChatDrawer";
import { monoFont } from "../../theme";

type GetModelsForMakeId = {
  makeId: number;
  modelId: number;
  makeName: string;
  modelName: string;
};

type Props = {
  makeId?: number;
};

const QUERY = gql`
  query getModelsForMake($makeId: Int!) {
    getModelsForMakeId(makeId: $makeId) {
      makeId
      modelId
      makeName
      modelName
    }
  }
`;

const DisplayDetailsForMake = ({ makeId }: Props) => {
  const [filter, setFilter] = useState("");
  const { loading, error, data } = useQuery<{
    getModelsForMakeId: GetModelsForMakeId[];
  }>(QUERY, {
    variables: { makeId },
    fetchPolicy: "network-only",
    skip: !makeId,
  });

  if (!makeId) return "No valid Make ID was provided";
  if (error) return <p>Error : {error.message}</p>;
  if (loading) return null;
  if (!data) return <p>Data is undefined</p>;
  if (data.getModelsForMakeId.length === 0) return "No Results Found";

  const models = data.getModelsForMakeId;
  const makeName = models[0].makeName;
  const visibleModels = models.filter((m) =>
    m.modelName.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <Stack spacing={4}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Make {makeId}
          </Typography>
          <Typography variant="h1">{makeName}</Typography>
          <Typography color="text.secondary">
            {models.length} models on record
          </Typography>
        </Stack>
        <ChatDrawer
          vehicleData={models}
          label={`Ask about ${makeName} models`}
          variant="contained"
        />
      </Box>

      <Stack spacing={2} component="section" aria-labelledby="models-heading">
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography variant="h2" id="models-heading">
            Models
          </Typography>
          <TextField
            type="search"
            size="small"
            placeholder="Filter models"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ flex: "0 1 320px" }}
            slotProps={{
              htmlInput: { "aria-label": "Filter models" },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 480 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 140 }}>Model ID</TableCell>
                <TableCell>Model</TableCell>
                <TableCell sx={{ width: 160 }}>Make</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleModels.map((d) => (
                <TableRow key={d.modelId} hover>
                  <TableCell
                    sx={{ fontFamily: monoFont, color: "text.secondary" }}
                  >
                    {d.modelId}
                  </TableCell>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: 500 }}
                  >
                    {d.modelName}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {d.makeName}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="body2" color="text.secondary">
          Showing {visibleModels.length} of {models.length}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default DisplayDetailsForMake;
