package template

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/url"
	"regexp"
	"strconv"
	"text/template"
	"time"

	"github.com/prometheus/common/model"
)

type query struct {
	Datasource string `json:"datasource"`
	Expr       string `json:"expr"`
}

var (
	defaultFuncs = template.FuncMap{
		"filterLabels":    filterLabelsFunc,
		"filterLabelsRe":  filterLabelsReFunc,
		"graphLink":       graphLinkFunc,
		"removeLabels":    removeLabelsFunc,
		"removeLabelslRe": removeLabelsReFunc,
		"tableLink":       tableLinkFunc,
		"toTime":          toTimeFunc,
	}
)

// filterLabelsFunc removes all labels that do not match the string.
func filterLabelsFunc(m Labels, match string) Labels {
	res := make(Labels)
	for k, v := range m {
		if k == match {
			res[k] = v
		}
	}
	return res
}

// filterLabelsReFunc removes all labels that do not match the regex.
func filterLabelsReFunc(m Labels, pattern string) Labels {
	re := regexp.MustCompile(pattern)
	res := make(Labels)
	for k, v := range m {
		if re.MatchString(k) {
			res[k] = v
		}
	}
	return res
}

func graphLinkFunc(data string) string {
	var q query
	if err := json.Unmarshal([]byte(data), &q); err != nil {
		return ""
	}
	datasource := url.QueryEscape(q.Datasource)
	expr := url.QueryEscape(q.Expr)
	return fmt.Sprintf(`/explore?left={"datasource":%[1]q,"queries":[{"datasource":%[1]q,"expr":%q,"instant":false,"range":true,"refId":"A"}],"range":{"from":"now-1h","to":"now"}}`, datasource, expr)
}

// removeLabelsFunc removes all labels that match the string.
func removeLabelsFunc(m Labels, match string) Labels {
	res := make(Labels)
	for k, v := range m {
		if k != match {
			res[k] = v
		}
	}
	return res
}

// removeLabelsReFunc removes all labels that match the regex.
func removeLabelsReFunc(m Labels, pattern string) Labels {
	re := regexp.MustCompile(pattern)
	res := make(Labels)
	for k, v := range m {
		if !re.MatchString(k) {
			res[k] = v
		}
	}
	return res
}

func tableLinkFunc(data string) string {
	var q query
	if err := json.Unmarshal([]byte(data), &q); err != nil {
		return ""
	}
	datasource := url.QueryEscape(q.Datasource)
	expr := url.QueryEscape(q.Expr)
	return fmt.Sprintf(`/explore?left={"datasource":%[1]q,"queries":[{"datasource":%[1]q,"expr":%q,"instant":true,"range":false,"refId":"A"}],"range":{"from":"now-1h","to":"now"}}`, datasource, expr)
}

func convertToFloat(i interface{}) (float64, error) {
	switch v := i.(type) {
	case float64:
		return v, nil
	case string:
		return strconv.ParseFloat(v, 64)
	case int:
		return float64(v), nil
	case uint:
		return float64(v), nil
	case int64:
		return float64(v), nil
	case uint64:
		return float64(v), nil
	default:
		return 0, fmt.Errorf("can't convert %T to float", v)
	}
}

func floatToTime(v float64) (*time.Time, error) {
	if math.IsNaN(v) || math.IsInf(v, 0) {
		return nil, errors.New("value is NaN or Inf")
	}
	timestamp := v * 1e9
	if timestamp > math.MaxInt64 || timestamp < math.MinInt64 {
		return nil, fmt.Errorf("%v cannot be represented as a nanoseconds timestamp since it overflows int64", v)
	}
	t := model.TimeFromUnixNano(int64(timestamp)).Time().UTC()
	return &t, nil
}

func toTimeFunc(data interface{}) (*time.Time, error) {
	v, err := convertToFloat(data)
	if err != nil {
		return nil, err
	}
	return floatToTime(v)
}
