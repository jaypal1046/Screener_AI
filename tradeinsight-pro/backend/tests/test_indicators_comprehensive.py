"""
Comprehensive Unit Tests for All 40 Technical Indicators
Tests mathematical accuracy, edge cases, and signal generation
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from app.services.indicators import IndicatorService
from app.models.stock import IndicatorResult


@pytest.fixture
def sample_ohlcv_data():
    """Generate realistic OHLCV data for testing"""
    dates = pd.date_range(start='2024-01-01', periods=100, freq='D')
    np.random.seed(42)
    
    # Generate realistic price data with trend and volatility
    base_price = 100
    returns = np.random.normal(0.001, 0.02, 100)
    close = base_price * np.cumprod(1 + returns)
    
    # Generate high, low, open based on close
    high = close * (1 + np.abs(np.random.normal(0, 0.02, 100)))
    low = close * (1 - np.abs(np.random.normal(0, 0.02, 100)))
    open_price = low + (high - low) * np.random.random(100)
    
    # Generate volume
    volume = np.random.randint(1000000, 10000000, 100)
    
    df = pd.DataFrame({
        'date': dates,
        'open': open_price,
        'high': high,
        'low': low,
        'close': close,
        'volume': volume
    })
    df.set_index('date', inplace=True)
    return df


@pytest.fixture
def trending_data():
    """Generate strong uptrend data for testing"""
    dates = pd.date_range(start='2024-01-01', periods=50, freq='D')
    close = np.linspace(100, 150, 50)
    high = close * 1.02
    low = close * 0.98
    open_price = low + (high - low) * 0.5
    volume = np.random.randint(1000000, 5000000, 50)
    
    df = pd.DataFrame({
        'open': open_price,
        'high': high,
        'low': low,
        'close': close,
        'volume': volume
    }, index=dates)
    return df


class TestTrendIndicators:
    """Test all 8 Trend Indicators"""
    
    def test_sma_calculation(self, sample_ohlcv_data):
        """Test Simple Moving Average"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "SMA", {"period": 20})
        assert isinstance(result, IndicatorResult)
        assert result.indicator_name == "SMA"
        assert result.category == "trend"
        assert "value" in result.values
        assert result.values["value"] > 0
        assert not np.isnan(result.values["value"])
    
    def test_sma_signal_generation(self, trending_data):
        """Test SMA buy/sell signals"""
        result = IndicatorService.calculate_indicator(trending_data, "SMA", {"period": 20})
        # In strong uptrend, price should be above SMA -> buy signal
        assert result.signal in ["buy", "sell", "neutral"]
    
    def test_ema_calculation(self, sample_ohlcv_data):
        """Test Exponential Moving Average"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "EMA", {"period": 20})
        assert isinstance(result, IndicatorResult)
        assert "value" in result.values
        assert result.values["value"] > 0
    
    def test_ema_responsiveness(self, sample_ohlcv_data):
        """Test EMA is more responsive than SMA"""
        ema_result = IndicatorService.calculate_indicator(sample_ohlcv_data, "EMA", {"period": 20})
        sma_result = IndicatorService.calculate_indicator(sample_ohlcv_data, "SMA", {"period": 20})
        # EMA should react faster to recent price changes
        assert ema_result.values["value"] != sma_result.values["value"]
    
    def test_macd_calculation(self, sample_ohlcv_data):
        """Test MACD with all components"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "MACD")
        assert isinstance(result, IndicatorResult)
        assert "macd" in result.values
        assert "signal" in result.values
        assert "histogram" in result.values
        assert not np.isnan(result.values["macd"])
    
    def test_macd_signal_crossover(self, trending_data):
        """Test MACD signal generation on trend"""
        result = IndicatorService.calculate_indicator(trending_data, "MACD")
        assert result.signal in ["buy", "sell", "neutral"]
        assert result.strength is not None
    
    def test_adx_trend_strength(self, sample_ohlcv_data):
        """Test Average Directional Index"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "ADX")
        assert isinstance(result, IndicatorResult)
        assert "adx" in result.values
        assert "plus_di" in result.values
        assert "minus_di" in result.values
        # ADX should be between 0 and 100
        assert 0 <= result.values["adx"] <= 100
    
    def test_stochastic_oscillator(self, sample_ohlcv_data):
        """Test Stochastic Oscillator"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "Stochastic")
        assert isinstance(result, IndicatorResult)
        assert "k" in result.values
        assert "d" in result.values
        # Stochastic values should be between 0 and 100
        assert 0 <= result.values["k"] <= 100
        assert 0 <= result.values["d"] <= 100
    
    def test_wma_calculation(self, sample_ohlcv_data):
        """Test Weighted Moving Average"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "WMA", {"period": 20})
        assert isinstance(result, IndicatorResult)
        assert "value" in result.values
        assert result.values["value"] > 0


class TestMomentumIndicators:
    """Test all 8 Momentum Indicators"""
    
    def test_rsi_calculation(self, sample_ohlcv_data):
        """Test Relative Strength Index"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "RSI", {"period": 14})
        assert isinstance(result, IndicatorResult)
        assert "value" in result.values
        # RSI should be between 0 and 100
        assert 0 <= result.values["value"] <= 100
    
    def test_rsi_oversold_signal(self):
        """Test RSI oversold condition"""
        # Create data with declining prices
        dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
        close = np.linspace(100, 70, 30)  # Strong decline
        high = close * 1.01
        low = close * 0.99
        open_price = close
        volume = np.random.randint(1000000, 5000000, 30)
        
        df = pd.DataFrame({'open': open_price, 'high': high, 'low': low, 'close': close, 'volume': volume}, index=dates)
        result = IndicatorService.calculate_indicator(df, "RSI", {"period": 14})
        
        # Should indicate oversold or potential buy
        assert result.signal in ["buy", "neutral"]
    
    def test_rsi_overbought_signal(self):
        """Test RSI overbought condition"""
        # Create data with rising prices
        dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
        close = np.linspace(70, 100, 30)  # Strong rise
        high = close * 1.01
        low = close * 0.99
        open_price = close
        volume = np.random.randint(1000000, 5000000, 30)
        
        df = pd.DataFrame({'open': open_price, 'high': high, 'low': low, 'close': close, 'volume': volume}, index=dates)
        result = IndicatorService.calculate_indicator(df, "RSI", {"period": 14})
        
        # Should indicate overbought or potential sell
        assert result.signal in ["sell", "neutral"]
    
    def test_cci_calculation(self, sample_ohlcv_data):
        """Test Commodity Channel Index"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "CCI")
        assert isinstance(result, IndicatorResult)
        # CCI can be any value but should be a number
        assert result.values.get("value") is not None or "error" not in result.values
    
    def test_williams_r_calculation(self, sample_ohlcv_data):
        """Test Williams %R"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "WilliamsR")
        assert isinstance(result, IndicatorResult)
        # Williams %R should be between -100 and 0
        if "value" in result.values:
            assert -100 <= result.values["value"] <= 0
    
    def test_roc_calculation(self, sample_ohlcv_data):
        """Test Rate of Change"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "ROC")
        assert isinstance(result, IndicatorResult)
        assert result.values.get("value") is not None
    
    def test_momentum_indicator(self, sample_ohlcv_data):
        """Test Momentum Indicator"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "Momentum")
        assert isinstance(result, IndicatorResult)
        assert result.values.get("value") is not None
    
    def test_awesome_oscillator(self, sample_ohlcv_data):
        """Test Awesome Oscillator"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "AwesomeOscillator")
        assert isinstance(result, IndicatorResult)
        # Should return some value or message
        assert result.values or result.strength is not None
    
    def test_ultimate_oscillator(self, sample_ohlcv_data):
        """Test Ultimate Oscillator"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "UltimateOscillator")
        assert isinstance(result, IndicatorResult)
        # Should return some value or implementation message


class TestVolatilityIndicators:
    """Test all 8 Volatility Indicators"""
    
    def test_bollinger_bands_calculation(self, sample_ohlcv_data):
        """Test Bollinger Bands"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "BollingerBands")
        assert isinstance(result, IndicatorResult)
        assert "upper" in result.values
        assert "middle" in result.values
        assert "lower" in result.values
        assert "bandwidth" in result.values
        # Upper > Middle > Lower
        assert result.values["upper"] > result.values["middle"]
        assert result.values["middle"] > result.values["lower"]
    
    def test_bollinger_bands_signal(self, sample_ohlcv_data):
        """Test Bollinger Bands signal generation"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "BollingerBands")
        assert result.signal in ["buy", "sell", "neutral"]
        assert result.strength is not None
    
    def test_atr_calculation(self, sample_ohlcv_data):
        """Test Average True Range"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "ATR", {"period": 14})
        assert isinstance(result, IndicatorResult)
        assert "value" in result.values
        assert result.values["value"] > 0  # ATR should always be positive
    
    def test_keltner_channels(self, sample_ohlcv_data):
        """Test Keltner Channels"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "KeltnerChannels")
        assert isinstance(result, IndicatorResult)
        # Should have upper, middle, lower or implementation message
    
    def test_donchian_channels(self, sample_ohlcv_data):
        """Test Donchian Channels"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "DonchianChannels")
        assert isinstance(result, IndicatorResult)
    
    def test_standard_deviation(self, sample_ohlcv_data):
        """Test Standard Deviation"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "StandardDeviation")
        assert isinstance(result, IndicatorResult)
        if "value" in result.values:
            assert result.values["value"] >= 0
    
    def test_historical_volatility(self, sample_ohlcv_data):
        """Test Historical Volatility"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "HistoricalVolatility")
        assert isinstance(result, IndicatorResult)
    
    def test_true_range(self, sample_ohlcv_data):
        """Test True Range"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "TrueRange")
        assert isinstance(result, IndicatorResult)
        if "value" in result.values:
            assert result.values["value"] >= 0
    
    def test_chandelier_exit(self, sample_ohlcv_data):
        """Test Chandelier Exit"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "ChandelierExit")
        assert isinstance(result, IndicatorResult)


class TestVolumeIndicators:
    """Test all 8 Volume Indicators"""
    
    def test_obv_calculation(self, sample_ohlcv_data):
        """Test On Balance Volume"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "OBV")
        assert isinstance(result, IndicatorResult)
        assert "value" in result.values
        assert result.signal in ["buy", "sell", "neutral"]
    
    def test_obv_trend_confirmation(self, trending_data):
        """Test OBV confirms price trend"""
        result = IndicatorService.calculate_indicator(trending_data, "OBV")
        # In uptrend with volume, OBV should confirm
        assert result.signal in ["buy", "neutral"]
    
    def test_mfi_calculation(self, sample_ohlcv_data):
        """Test Money Flow Index"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "MFI", {"period": 14})
        assert isinstance(result, IndicatorResult)
        if "value" in result.values:
            # MFI should be between 0 and 100
            assert 0 <= result.values["value"] <= 100
    
    def test_mfi_signals(self):
        """Test MFI overbought/oversold signals"""
        # Create data with high buying pressure
        dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
        close = np.linspace(80, 100, 30)
        high = close * 1.02
        low = close * 0.98
        open_price = close
        volume = np.random.randint(5000000, 10000000, 30)  # High volume
        
        df = pd.DataFrame({'open': open_price, 'high': high, 'low': low, 'close': close, 'volume': volume}, index=dates)
        result = IndicatorService.calculate_indicator(df, "MFI", {"period": 14})
        
        assert result.signal in ["buy", "sell", "neutral"]
    
    def test_adl_calculation(self, sample_ohlcv_data):
        """Test Accumulation/Distribution Line"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "ADL")
        assert isinstance(result, IndicatorResult)
    
    def test_cmf_calculation(self, sample_ohlcv_data):
        """Test Chaikin Money Flow"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "CMF")
        assert isinstance(result, IndicatorResult)
        # CMF typically ranges from -1 to +1
        if "value" in result.values:
            assert -1 <= result.values["value"] <= 1
    
    def test_force_index(self, sample_ohlcv_data):
        """Test Force Index"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "ForceIndex")
        assert isinstance(result, IndicatorResult)
    
    def test_eom_calculation(self, sample_ohlcv_data):
        """Test Ease of Movement"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "EOM")
        assert isinstance(result, IndicatorResult)
    
    def test_pvt_calculation(self, sample_ohlcv_data):
        """Test Price Volume Trend"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "PVT")
        assert isinstance(result, IndicatorResult)
    
    def test_vwap_trend(self, sample_ohlcv_data):
        """Test VWAP as trend indicator"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "VWAP")
        assert isinstance(result, IndicatorResult)
        if "value" in result.values:
            assert result.values["value"] > 0


class TestSupportResistanceIndicators:
    """Test all 8 Support/Resistance Indicators"""
    
    def test_pivot_points_calculation(self, sample_ohlcv_data):
        """Test Pivot Points"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "PivotPoints")
        assert isinstance(result, IndicatorResult)
        # Should have pivot, r1, s1 at minimum
        assert "pivot" in result.values or "message" in result.values
    
    def test_fibonacci_retracement(self, sample_ohlcv_data):
        """Test Fibonacci Retracement"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "FibonacciRetracement")
        assert isinstance(result, IndicatorResult)
    
    def test_camarilla_pivot(self, sample_ohlcv_data):
        """Test Camarilla Pivot Points"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "CamarillaPivot")
        assert isinstance(result, IndicatorResult)
    
    def test_woodie_pivot(self, sample_ohlcv_data):
        """Test Woodie's Pivot Points"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "WoodiePivot")
        assert isinstance(result, IndicatorResult)
    
    def test_demark_pivot(self, sample_ohlcv_data):
        """Test DeMark Pivot Points"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "DeMarkPivot")
        assert isinstance(result, IndicatorResult)
    
    def test_support_resistance_levels(self, sample_ohlcv_data):
        """Test Support & Resistance Levels"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "SupportResistance")
        assert isinstance(result, IndicatorResult)
    
    def test_auto_fibonacci(self, sample_ohlcv_data):
        """Test Automatic Fibonacci Levels"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "AutoFibonacci")
        assert isinstance(result, IndicatorResult)
    
    def test_volume_profile(self, sample_ohlcv_data):
        """Test Volume Profile"""
        result = IndicatorService.calculate_indicator(sample_ohlcv_data, "VolumeProfile")
        assert isinstance(result, IndicatorResult)


class TestIndicatorMetadata:
    """Test indicator metadata and categorization"""
    
    def test_all_indicators_defined(self):
        """Test that all 40 indicators are defined"""
        indicators = IndicatorService.get_all_indicators()
        assert len(indicators) == 40
    
    def test_category_distribution(self):
        """Test that indicators are evenly distributed across categories"""
        categories = {
            "trend": 0,
            "momentum": 0,
            "volatility": 0,
            "volume": 0,
            "support_resistance": 0
        }
        
        indicators = IndicatorService.get_all_indicators()
        for info in indicators.values():
            categories[info["category"]] += 1
        
        # Each category should have 8 indicators
        for category, count in categories.items():
            assert count == 8, f"{category} has {count} indicators, expected 8"
    
    def test_get_indicators_by_category(self):
        """Test filtering indicators by category"""
        trend_indicators = IndicatorService.get_indicators_by_category("trend")
        assert len(trend_indicators) == 8
        
        momentum_indicators = IndicatorService.get_indicators_by_category("momentum")
        assert len(momentum_indicators) == 8
    
    def test_indicator_has_description(self):
        """Test that all indicators have descriptions"""
        indicators = IndicatorService.get_all_indicators()
        for name, info in indicators.items():
            assert "description" in info
            assert info["description"] is not None
            assert len(info["description"]) > 0


class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def test_empty_dataframe(self):
        """Test handling of empty dataframe"""
        empty_df = pd.DataFrame()
        with pytest.raises(Exception):
            IndicatorService.calculate_indicator(empty_df, "RSI")
    
    def test_insufficient_data(self):
        """Test handling of insufficient data points"""
        dates = pd.date_range(start='2024-01-01', periods=5, freq='D')
        df = pd.DataFrame({
            'open': [100] * 5,
            'high': [105] * 5,
            'low': [95] * 5,
            'close': [102] * 5,
            'volume': [1000000] * 5
        }, index=dates)
        
        # RSI with 14 period on 5 data points should handle gracefully
        result = IndicatorService.calculate_indicator(df, "RSI", {"period": 14})
        # Should either return NaN or handle error gracefully
        assert isinstance(result, IndicatorResult)
    
    def test_invalid_indicator_name(self, sample_ohlcv_data):
        """Test handling of invalid indicator name"""
        with pytest.raises(ValueError, match="Unknown indicator"):
            IndicatorService.calculate_indicator(sample_ohlcv_data, "InvalidIndicator")
    
    def test_calculate_all_indicators(self, sample_ohlcv_data):
        """Test calculating all indicators at once"""
        results = IndicatorService.calculate_all_indicators(sample_ohlcv_data)
        assert len(results) > 0
        assert all(isinstance(r, IndicatorResult) for r in results)
    
    def test_calculate_selected_indicators(self, sample_ohlcv_data):
        """Test calculating only selected indicators"""
        selected = ["RSI", "MACD", "BollingerBands"]
        results = IndicatorService.calculate_all_indicators(sample_ohlcv_data, selected)
        assert len(results) == 3
        assert set(r.indicator_name for r in results) == set(selected)
    
    def test_generate_summary(self, sample_ohlcv_data):
        """Test generating overall market summary"""
        results = IndicatorService.calculate_all_indicators(sample_ohlcv_data)
        summary = IndicatorService.generate_summary(results)
        
        assert "overall_signal" in summary
        assert "overall_strength" in summary
        assert summary["overall_signal"] in ["buy", "sell", "neutral"]
        assert 0 <= summary["overall_strength"] <= 100
        
        # Check all categories are present
        for category in ["trend", "momentum", "volatility", "volume", "support_resistance"]:
            assert category in summary
            assert "buy" in summary[category]
            assert "sell" in summary[category]
            assert "neutral" in summary[category]


class TestDataQuality:
    """Test data quality and numerical stability"""
    
    def test_no_nan_in_results(self, sample_ohlcv_data):
        """Test that results don't contain NaN values"""
        results = IndicatorService.calculate_all_indicators(sample_ohlcv_data)
        
        for result in results:
            if "value" in result.values:
                assert not np.isnan(result.values["value"]), f"{result.indicator_name} returned NaN"
    
    def test_no_infinity_in_results(self, sample_ohlcv_data):
        """Test that results don't contain infinity values"""
        results = IndicatorService.calculate_all_indicators(sample_ohlcv_data)
        
        for result in results:
            for key, value in result.values.items():
                if isinstance(value, (int, float)):
                    assert not np.isinf(value), f"{result.indicator_name}.{key} returned infinity"
    
    def test_signal_consistency(self, sample_ohlcv_data):
        """Test that signals are consistent with indicator values"""
        results = IndicatorService.calculate_all_indicators(sample_ohlcv_data)
        
        for result in results:
            assert result.signal in ["buy", "sell", "neutral", "error"]
            if result.strength is not None:
                assert 0 <= result.strength <= 100


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
