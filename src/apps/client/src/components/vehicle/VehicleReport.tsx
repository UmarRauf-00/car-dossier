import { gql, type TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import { useMemo } from "react";
import { Link, useParams } from "react-router";
import ChatDrawer from "../../ai-chat/ChatDrawer";
import { colors, monoFont } from "../../theme";

interface Recall {
  campaignNumber: string;
  reportDate?: string;
  component?: string;
  summary?: string;
  consequence?: string;
  remedy?: string;
}

interface Complaint {
  odiNumber: string;
  dateOfIncident?: string;
  dateFiled?: string;
  component?: string;
  summary?: string;
  crash: boolean;
  fire: boolean;
  injuries: number;
  deaths: number;
}

interface SafetyRating {
  vehicleId: number;
  description: string;
  overall?: string;
  frontCrash?: string;
  sideCrash?: string;
  rollover?: string;
}

interface VehicleReportType {
  make: string;
  model: string;
  year: number;
  recalls: Recall[];
  complaints: Complaint[];
  safetyRatings: SafetyRating[];
}

const QUERY: TypedDocumentNode<
  { vehicleReport: VehicleReportType },
  { make: string; model: string; year: number }
> = gql`
  query vehicleReport($make: String!, $model: String!, $year: Int!) {
    vehicleReport(make: $make, model: $model, year: $year) {
      make
      model
      year
      recalls {
        campaignNumber
        reportDate
        component
        summary
        consequence
        remedy
      }
      complaints {
        odiNumber
        dateOfIncident
        dateFiled
        component
        summary
        crash
        fire
        injuries
        deaths
      }
      safetyRatings {
        vehicleId
        description
        overall
        frontCrash
        sideCrash
        rollover
      }
    }
  }
`;

// "honda" -> "Honda", "bmw" -> "BMW"
const displayMake = (make: string) =>
  make.length <= 3
    ? make.toUpperCase()
    : make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();

// NHTSA dates come as MM/DD/YYYY; sort newest first
const toTime = (d?: string) => (d ? new Date(d).getTime() || 0 : 0);

// Complaints whose summary is only a pointer to an attachment tell Claude nothing
const isUsefulSummary = (s?: string) =>
  !!s && s.length > 40 && !/see attached/i.test(s);

const RECENT_COMPLAINTS = 10;

const Stars = ({ value }: { value?: string }) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    return (
      <Typography variant="body2" color="text.secondary">
        Not rated
      </Typography>
    );
  }
  return (
    <Box
      sx={{ display: "flex", color: colors.accent }}
      role="img"
      aria-label={`${n} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) =>
        i < n ? (
          <Star key={i} fontSize="small" />
        ) : (
          <StarBorder key={i} fontSize="small" />
        ),
      )}
    </Box>
  );
};

const Stat = ({
  label,
  value,
  detail,
  jumpTo,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  // id of a section further down the page; shows an arrow that scrolls to it
  jumpTo?: string;
}) => (
  <Paper
    variant="outlined"
    sx={{ p: 2.5, borderRadius: 3, flex: "1 1 200px", minWidth: 0 }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {jumpTo && (
        <IconButton
          component="a"
          href={`#${jumpTo}`}
          aria-label={`Jump to ${label.toLowerCase()}`}
          size="small"
          sx={{ m: -1, color: "primary.main" }}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            const target = document.getElementById(jumpTo);
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
            target?.focus({ preventScroll: true });
          }}
        >
          <ArrowDownward fontSize="small" />
        </IconButton>
      )}
    </Box>
    <Box sx={{ fontSize: 32, fontWeight: 600, lineHeight: 1.3 }}>{value}</Box>
    {detail && (
      <Typography variant="body2" color="text.secondary">
        {detail}
      </Typography>
    )}
  </Paper>
);

const VehicleReport = () => {
  const params = useParams();
  const make = params.make ?? "";
  const model = params.model ?? "";
  const year = Number(params.year);
  const validYear = Number.isInteger(year) && year > 0;

  const { loading, error, data } = useQuery(QUERY, {
    variables: { make, model, year },
    skip: !make || !model || !validYear,
  });

  const report = data?.vehicleReport;

  const complaintStats = useMemo(() => {
    const complaints = report?.complaints ?? [];
    const byComponent = new Map<string, number>();
    for (const c of complaints) {
      // A complaint can list several components, comma separated
      for (const part of (c.component ?? "UNKNOWN").split(",")) {
        const key = part.trim() || "UNKNOWN";
        byComponent.set(key, (byComponent.get(key) ?? 0) + 1);
      }
    }
    return {
      total: complaints.length,
      crashes: complaints.filter((c) => c.crash).length,
      fires: complaints.filter((c) => c.fire).length,
      injuries: complaints.reduce((sum, c) => sum + c.injuries, 0),
      deaths: complaints.reduce((sum, c) => sum + c.deaths, 0),
      topComponents: [...byComponent.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8),
      recent: [...complaints]
        .sort((a, b) => toTime(b.dateFiled) - toTime(a.dateFiled))
        .slice(0, RECENT_COMPLAINTS),
    };
  }, [report]);

  // What Claude gets in the chat: the full recalls and ratings, but complaints
  // summarised (a popular car can have hundreds) plus the latest useful ones
  const chatContext = useMemo(() => {
    if (!report) return undefined;
    return {
      vehicle: `${report.year} ${displayMake(report.make)} ${report.model}`,
      safetyRatings: report.safetyRatings,
      recalls: report.recalls.map(
        ({ component, summary, consequence, remedy, reportDate }) => ({
          component,
          reportDate,
          summary,
          consequence,
          remedy,
        }),
      ),
      complaintStats: {
        total: complaintStats.total,
        crashes: complaintStats.crashes,
        fires: complaintStats.fires,
        injuries: complaintStats.injuries,
        deaths: complaintStats.deaths,
        byComponent: Object.fromEntries(complaintStats.topComponents),
      },
      recentComplaints: [...report.complaints]
        .filter((c) => isUsefulSummary(c.summary))
        .sort((a, b) => toTime(b.dateFiled) - toTime(a.dateFiled))
        .slice(0, 20)
        .map(({ dateOfIncident, component, summary, crash, fire }) => ({
          dateOfIncident,
          component,
          summary,
          crash,
          fire,
        })),
    };
  }, [report, complaintStats]);

  const title = `${validYear ? year : ""} ${displayMake(make)} ${model}`.trim();
  const bestRating = report?.safetyRatings.find((r) => Number(r.overall) > 0);

  return (
    <Stack spacing={4}>
      <Link
        to="/"
        onClick={(e) => {
          // history.back() keeps the user's search; "/" is the fallback
          if (window.history.length > 1) {
            e.preventDefault();
            window.history.back();
          }
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          minHeight: 44,
          fontSize: 14,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        <ArrowBack fontSize="small" />
        Back to results
      </Link>

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
            NHTSA vehicle report
          </Typography>
          <Typography variant="h1">{title}</Typography>
        </Stack>
        {chatContext && (
          <ChatDrawer
            vehicleData={chatContext}
            label="Ask about this car"
            variant="contained"
          />
        )}
      </Box>

      {!validYear && <Alert severity="error">That isn't a valid year.</Alert>}
      {error && <Alert severity="error">{error.message}</Alert>}
      {loading && (
        <Typography color="text.secondary">Loading NHTSA records…</Typography>
      )}

      {report && (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Stat
              label="Recalls"
              value={report.recalls.length}
              detail={
                report.recalls.length === 0 ? "None on record" : undefined
              }
            />
            <Stat
              label="Owner complaints"
              value={complaintStats.total}
              jumpTo={complaintStats.total > 0 ? "complaints" : undefined}
              detail={`${complaintStats.crashes} crashes · ${complaintStats.fires} fires · ${complaintStats.injuries} injuries`}
            />
            <Stat
              label="Overall safety rating"
              value={
                bestRating ? (
                  `${bestRating.overall} / 5`
                ) : (
                  <Box component="span" sx={{ fontSize: 20 }}>
                    Not rated
                  </Box>
                )
              }
              detail={bestRating?.description}
            />
          </Box>

          <Stack spacing={2} component="section" aria-labelledby="ratings">
            <Typography variant="h2" id="ratings">
              Safety ratings
            </Typography>
            {report.safetyRatings.length === 0 ? (
              <Typography color="text.secondary">
                NHTSA hasn't crash-tested this vehicle.
              </Typography>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 640 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Variant</TableCell>
                      <TableCell>Overall</TableCell>
                      <TableCell>Frontal crash</TableCell>
                      <TableCell>Side crash</TableCell>
                      <TableCell>Rollover</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.safetyRatings.map((r) => (
                      <TableRow key={r.vehicleId}>
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ fontWeight: 500 }}
                        >
                          {r.description}
                        </TableCell>
                        <TableCell>
                          <Stars value={r.overall} />
                        </TableCell>
                        <TableCell>
                          <Stars value={r.frontCrash} />
                        </TableCell>
                        <TableCell>
                          <Stars value={r.sideCrash} />
                        </TableCell>
                        <TableCell>
                          <Stars value={r.rollover} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>

          <Stack spacing={2} component="section" aria-labelledby="recalls">
            <Typography variant="h2" id="recalls">
              Recalls
            </Typography>
            {report.recalls.length === 0 ? (
              <Typography color="text.secondary">
                No recalls on record.
              </Typography>
            ) : (
              report.recalls.map((r) => (
                <Paper
                  key={r.campaignNumber}
                  variant="outlined"
                  sx={{ borderRadius: 3, overflow: "hidden" }}
                >
                  <Box sx={{ p: 2.5, pb: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                        alignItems: "baseline",
                        mb: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>
                        {r.component}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: monoFont }}
                      >
                        {r.campaignNumber} · {r.reportDate}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{r.summary}</Typography>
                  </Box>
                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      borderTop: `1px solid ${colors.border}`,
                      "&::before": { display: "none" },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Consequence and remedy
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={1.5}>
                        <Typography variant="body2">
                          <strong>Consequence:</strong> {r.consequence}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Remedy:</strong> {r.remedy}
                        </Typography>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              ))
            )}
          </Stack>

          <Stack spacing={2} component="section" aria-labelledby="complaints">
            <Typography
              variant="h2"
              id="complaints"
              tabIndex={-1}
              sx={{ scrollMarginTop: 16, outline: "none" }}
            >
              Owner complaints
            </Typography>
            {complaintStats.total === 0 ? (
              <Typography color="text.secondary">
                No complaints on record.
              </Typography>
            ) : (
              <>
                <TableContainer>
                  <Table sx={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 120 }}>Filed</TableCell>
                        <TableCell sx={{ width: 200 }}>Component</TableCell>
                        <TableCell>Summary</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {complaintStats.recent.map((c) => (
                        <TableRow key={c.odiNumber}>
                          <TableCell
                            sx={{
                              fontFamily: monoFont,
                              color: "text.secondary",
                              verticalAlign: "top",
                            }}
                          >
                            {c.dateFiled}
                          </TableCell>
                          <TableCell sx={{ verticalAlign: "top" }}>
                            {c.component}
                          </TableCell>
                          <TableCell>
                            <Stack spacing={1}>
                              <Typography variant="body2">
                                {c.summary}
                              </Typography>
                              {(c.crash || c.fire || c.injuries > 0) && (
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  {c.crash && (
                                    <Chip size="small" label="Crash" />
                                  )}
                                  {c.fire && <Chip size="small" label="Fire" />}
                                  {c.injuries > 0 && (
                                    <Chip
                                      size="small"
                                      label={`${c.injuries} injured`}
                                    />
                                  )}
                                </Box>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="body2" color="text.secondary">
                  Showing the {complaintStats.recent.length} most recent of{" "}
                  {complaintStats.total}
                </Typography>
              </>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default VehicleReport;
