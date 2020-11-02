import React, { useCallback, useEffect, useState } from "react";

import {
  Container,
  CssBaseline,
  Grid,
  makeStyles,
  Typography
} from "@material-ui/core";

import { AuthConsumer } from "../../../../providers/AuthProvider";
import ReportFinanceDetailService from "../../../../services/reportFinanceDetail.service";
import FinanceDetailTable from "./component/FinanceDetailTable";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: "40px 0px"
  },
  title: {
    paddingBottom: theme.spacing(1)
  }
}));

export default function ReportFinanceDetail(props) {
  const classes = useStyles();
  const [financeDetail, setFinanceDetail] = useState([]);
  const { dateFrom, dateTo } = props.match.params;

  const getReportFinanceDetails = useCallback(() => {
    ReportFinanceDetailService.getReportFinanceDetail(
      dateFrom,
      dateTo
    ).then((res) => setFinanceDetail(res.data.data));
  }, [dateFrom, dateTo]);

  useEffect(() => {
    getReportFinanceDetails();
  }, [getReportFinanceDetails]);

  return (
    <AuthConsumer>
      {({ user }) => (
        <React.Fragment>
          <CssBaseline />
          <Container maxWidth={false} className={classes.root}>
            <Grid container justify="center" spacing={2}>
              <Grid item md={12} xs={12}>
                <Typography
                  component="h1"
                  variant="h2"
                  color="textPrimary"
                  className={classes.title}
                >
                  Report Finance Detail
                </Typography>
                <Typography component="p" variant="body2" color="textPrimary">
                  This page is used to display the Report Finance Detail
                </Typography>
                <FinanceDetailTable financeDetail={financeDetail} />
              </Grid>
            </Grid>
          </Container>
        </React.Fragment>
      )}
    </AuthConsumer>
  );
}
