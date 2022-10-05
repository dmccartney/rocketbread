import {
  AppBar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Link,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import useDroppedFile from "../hooks/useDroppedFile";
import useLocalJsonFile from "../hooks/useLocalJsonFile";
import { Link as RouterLink } from "react-router-dom";
import { useRef } from "react";
import { HelpOutline } from "@mui/icons-material";

function OpenJsonFileButton() {
  let fileRef = useRef();
  let { clear, set, file } = useLocalJsonFile();
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {file && (
        <Chip
          variant="outlined"
          label={file.fileName}
          clickable
          component={RouterLink}
          to={`/local/${file.fileId}`}
          onDelete={(e) => {
            e.preventDefault();
            clear();
          }}
        />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="*/*"
        value={""}
        style={{ display: "none" }}
        onChange={(e) => set(e.target.files[0])}
      />
      <Button onClick={() => fileRef.current?.click()}>Choose file</Button>
    </Stack>
  );
}

export default function Layout({ breadcrumbs = [], children }) {
  let { set } = useLocalJsonFile();
  let { isOver, canDrop, dropRef } = useDroppedFile({
    onFileLoaded: (file) => set(file),
  });
  return (
    <Box
      ref={dropRef}
      sx={{
        display: "flex",
        background:
          isOver && canDrop
            ? "repeating-conic-gradient(#CCC0% 25%, transparent 0% 50%) 50% / 20px 20px"
            : undefined,
      }}
    >
      <AppBar component="nav" color="primary">
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {isOver ? (
              "Drop JSON file to analyze it."
            ) : (
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>Rocket Bread</span>
                <Tooltip
                  title={
                    <Stack spacing={1} sx={{ m: 1 }}>
                      <Typography variant="h6">What is this?</Typography>
                      <Typography variant="body2">
                        This is a tool for{" "}
                        <Link
                          href="https://rocketpool.net/"
                          target="_blank"
                          color="inherit"
                          underline="always"
                        >
                          Rocket Pool
                        </Link>{" "}
                        operators to analyze their{" "}
                        <Link
                          href="https://github.com/rocket-pool/rewards-trees"
                          target="_blank"
                          color="inherit"
                          underline="always"
                        >
                          periodic rewards
                        </Link>
                        .
                      </Typography>
                      <Typography variant="h6">How does it work?</Typography>
                      <Typography variant="body2">
                        It loads all finalized rewards from the chain + IPFS.
                        And it allows you to analyze unfinalized rewards from
                        JSON files.
                      </Typography>
                      <Typography variant="h6">Who made this?</Typography>
                      <Typography variant="body2">
                        This unofficial tool was made by{" "}
                        <Link
                          href="https://dmccartney.com"
                          target="_blank"
                          color="inherit"
                          underline="always"
                        >
                          dmccartney
                        </Link>
                        .
                      </Typography>
                    </Stack>
                  }
                  sx={{ cursor: "help" }}
                >
                  <HelpOutline color="disabled" fontSize="inherit" />
                </Tooltip>
              </Stack>
            )}
          </Typography>
          <OpenJsonFileButton />
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          opacity: isOver && canDrop ? "0.1" : "1.0",
        }}
      >
        <Toolbar />
        {!breadcrumbs?.length ? null : (
          <Breadcrumbs sx={{ p: 3 }}>
            {breadcrumbs.map(({ label, href }, n) => (
              <Link
                key={`breadcrumb-${n}`}
                underline="hover"
                component={RouterLink}
                color={
                  n === breadcrumbs.length - 1 ? "text.primary" : "inherit"
                }
                to={href}
              >
                {label}
              </Link>
            ))}
          </Breadcrumbs>
        )}
        <Stack sx={{ width: "100%", pl: 3, pr: 3 }}>{children}</Stack>
      </Box>
    </Box>
  );
}
