import * as React from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import testStyle from "@/styles/Test.module.scss";

export default function Test() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div className={testStyle.container}>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        Open Popover
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        /* transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }} */
      >
        <div className={testStyle.monthList}>
          <div className={testStyle.row}>
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>
            <button>6</button>
            <button>7</button>
          </div>
          <div className={testStyle.row}>
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>
            <button>6</button>
            <button>7</button>
          </div>
          <div className={testStyle.row}>
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>
            <button>6</button>
            <button>7</button>
          </div>
          <div className={testStyle.row}>
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>
            <button>6</button>
            <button>7</button>
          </div>
          <div className={testStyle.row}>
            <button>1</button>
            <button>2</button>
          </div>
        </div>
      </Popover>
    </div>
  );
}
