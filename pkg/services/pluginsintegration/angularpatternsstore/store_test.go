package angularpatternsstore

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/infra/kvstore"
)

func TestAngularPatternsStore(t *testing.T) {
	mockPatterns := []map[string]interface{}{
		{"name": "PanelCtrl", "type": "contains", "pattern": "PanelCtrl"},
		{"name": "ConfigCtrl", "type": "contains", "pattern": "ConfigCtrl"},
	}

	t.Run("get set", func(t *testing.T) {
		svc := ProvideService(kvstore.NewFakeKVStore())

		t.Run("get empty", func(t *testing.T) {
			_, err := svc.Get(context.Background())
			require.ErrorIs(t, err, ErrNoCachedValue)
		})

		t.Run("set and get", func(t *testing.T) {
			err := svc.Set(context.Background(), mockPatterns)
			require.NoError(t, err)

			expV, err := json.Marshal(mockPatterns)
			require.NoError(t, err)

			dbV, err := svc.Get(context.Background())
			require.NoError(t, err)
			require.Equal(t, string(expV), dbV)
		})
	})

	t.Run("latest update", func(t *testing.T) {
		svc := ProvideService(kvstore.NewFakeKVStore())

		t.Run("empty", func(t *testing.T) {
			lastUpdated, err := svc.GetLastUpdated(context.Background())
			require.NoError(t, err)
			require.Zero(t, lastUpdated)
		})

		t.Run("not empty", func(t *testing.T) {
			err := svc.Set(context.Background(), mockPatterns)
			require.NoError(t, err)

			lastUpdated, err := svc.GetLastUpdated(context.Background())
			require.WithinDuration(t, time.Now(), lastUpdated, time.Second*10)
		})

		t.Run("invalid timestamp stored", func(t *testing.T) {
			err := svc.kv.Set(context.Background(), keyLastUpdated, "abcd")
			require.NoError(t, err)

			lastUpdated, err := svc.GetLastUpdated(context.Background())
			require.NoError(t, err)
			require.Zero(t, lastUpdated)
		})
	})
}
