import { CircularProgress, Box } from "@mui/material";

function Loading() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 1000,
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  );
}

export default Loading;
