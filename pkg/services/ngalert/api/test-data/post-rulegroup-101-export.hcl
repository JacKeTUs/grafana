resource "grafana_rule_group" "rule_group_0000" {
  org_id           = 1
  name             = "group101"
  folder_uid       = "e4584834-1a87-4dff-8913-8a4748dfca79"
  interval_seconds = 10

  rule {
    name      = "prom query with SSE - 2"
    condition = "condition"

    data {
      ref_id     = "query"
      query_type = ""

      relative_time_range {
        from = 18000
        to   = 10800
      }

      datasource_uid = "000000002"
      model          = "{\n              \"expr\": \"http_request_duration_microseconds_count\",\n              \"hide\": false,\n              \"interval\": \"\",\n              \"intervalMs\": 1000,\n              \"legendFormat\": \"\",\n              \"maxDataPoints\": 100,\n              \"refId\": \"query\"\n            }"
    }
    data {
      ref_id     = "reduced"
      query_type = ""

      relative_time_range {
        from = 18000
        to   = 10800
      }

      datasource_uid = "__expr__"
      model          = "{\n              \"expression\": \"query\",\n              \"hide\": false,\n              \"intervalMs\": 1000,\n              \"maxDataPoints\": 100,\n              \"reducer\": \"mean\",\n              \"refId\": \"reduced\",\n              \"type\": \"reduce\"\n            }"
    }
    data {
      ref_id     = "condition"
      query_type = ""

      relative_time_range {
        from = 18000
        to   = 10800
      }

      datasource_uid = "__expr__"
      model          = "{\n              \"expression\": \"$reduced > 10\",\n              \"hide\": false,\n              \"intervalMs\": 1000,\n              \"maxDataPoints\": 100,\n              \"refId\": \"condition\",\n              \"type\": \"math\"\n            }"
    }

    no_data_state  = "NoData"
    exec_err_state = "Alerting"
    for            = 0
    annotations    = null
    labels         = null
    is_paused      = false
  }
  rule {
    name      = "reduced testdata query - 2"
    condition = "B"

    data {
      ref_id     = "A"
      query_type = ""

      relative_time_range {
        from = 18000
        to   = 10800
      }

      datasource_uid = "000000004"
      model          = "{\n              \"alias\": \"just-testing\",\n              \"intervalMs\": 1000,\n              \"maxDataPoints\": 100,\n              \"orgId\": 0,\n              \"refId\": \"A\",\n              \"scenarioId\": \"csv_metric_values\",\n              \"stringInput\": \"1,20,90,30,5,0\"\n            }"
    }
    data {
      ref_id     = "B"
      query_type = ""

      relative_time_range {
        from = 18000
        to   = 10800
      }

      datasource_uid = "__expr__"
      model          = "{\n              \"expression\": \"$A\",\n              \"intervalMs\": 2000,\n              \"maxDataPoints\": 200,\n              \"orgId\": 0,\n              \"reducer\": \"mean\",\n              \"refId\": \"B\",\n              \"type\": \"reduce\"\n            }"
    }

    no_data_state  = "NoData"
    exec_err_state = "Alerting"
    for            = 0
    annotations    = null
    labels         = null
    is_paused      = false
  }
}
