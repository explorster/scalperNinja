//import TradingView/ta/7
// This Pine Script™ code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © billazoo

//@version=6
indicator('scalperKing', overlay = true, max_lines_count = 250)
// SET TOOLTIPS AND GROUPS {
SIB_TT = 'Show body\'s that are inside previous bars high and low '
SM_TT = 'Hide the mid point of each bar'
ST_TT = 'Show Profit targets 1 and 2.(gray tick marks)'
//}

// USER INPUTS{
showMidNiteOpen = input.bool(false, 'Show mid_Nite Open', group = 'Show or Hide Ranges.')
showSessionOPen = input.bool(false, 'Show session Open')
showNYOpen = input.bool(false, 'Show New York Open')
showInsideBars = input.bool(false, 'Show inside bars', SIB_TT, group = 'General Settings')
showMid = input.bool(false, 'Show Bar mid points', SM_TT, group = 'General Settings')
showMids = input.bool(false, 'Show Up / lower mid level', group = 'General Settings')
showTargets = input.bool(false, 'Show Profit targets', ST_TT, group = 'General Settings')
ShowLeadingMa = input.bool(false, 'Show/Hide MA', 'Show Or Hide Moving Average', group = 'Moving Average Settings')
customLength = input.int(title = 'zxma', tooltip = 'Select a Length for the custom MA.', defval = 50, minval = 21, maxval = 200, group = 'Moving Average Settings')
//}

// inside body candle colors{
color insideBodyColor = na
if showInsideBars
    insideBody = close < high[1] and close > low[1]
    insideBodyColor := insideBody ? color.yellow : na
    insideBodyColor
barcolor(insideBodyColor)
//}

//Show bars midPoint and profit targets / stops{
var float midPoint = 0.00
var float ubl = 0.00 // ubl = upper bar line
var float dbl = 0.00 // dbl = down bar line
var float profitTarget1 = 0.00
var float profitTarget2 = 0.00
var float stopTarget = 0.00
highTick = high + 0.25
lowTick = low - 0.25
zeroBar = close == open
positiveBar = close > open or zeroBar
negativeBar = close < open or zeroBar
if positiveBar
    midPoint := math.round_to_mintick((high - low) * 0.5 + low)
    ubl := math.round_to_mintick((high - low) * 0.25 + low)
    dbl := math.round_to_mintick((high - low) * 0.75 + low)
    profitTarget2 := showTargets ? math.round_to_mintick(high[0] - low[0] + midPoint) : na
    stopTarget := showTargets ? math.round_to_mintick(math.abs(low - 0.25)) : na
    profitTarget1 := showTargets ? math.round_to_mintick((profitTarget2 - high[0]) * 0.50 + high[0]) : na
    profitTarget1

else if negativeBar
    midPoint := math.round_to_mintick(high - (high - low) * 0.5)
    dbl := math.round_to_mintick(high - (high - low) * 0.25)
    ubl := math.round_to_mintick(high - (high - low) * 0.75)
    profitTarget2 := showTargets ? math.round_to_mintick(math.abs(high[0] - low[0] - midPoint)) : na

    stopTarget := showTargets ? math.round_to_mintick(math.abs(high + 0.25)) : na
    profitTarget1 := showTargets ? math.round_to_mintick((profitTarget2 - low[0]) * 0.50 + low[0]) : na
    profitTarget1
color midColor = color.white
color ublColor = color.rgb(117, 130, 159)
color dblColor = color.rgb(114, 130, 159)
barMid = showMid ? midPoint : na
// calculate profit and stop loss zones
//}

// custom moving average {
// Calculate the moving average
maEMA = ta.ema(midPoint, customLength)
maTMA = ta.ema(ta.ema(midPoint, math.ceil(customLength / 2)), math.floor(customLength / 2) + 1) // triangler moving average
maWMA = ta.wma(midPoint, customLength)
maRMA = ta.rma(midPoint, customLength)
maHMA = ta.hma(midPoint, customLength)
maLR = ta.linreg(midPoint, customLength, 0)
maVWMA = ta.vwma(midPoint, customLength)
newMa = math.round_to_mintick((maEMA + maTMA + maWMA + maRMA + maHMA + maLR + maVWMA) / 7)
maColors = newMa >= newMa[2] ? color.rgb(5, 240, 193) :newMa <= newMa[2] ? color.rgb(207, 7, 237) : na

// Plot the moving average with dynamic color
plot(ShowLeadingMa ? newMa : na, 'leading Ma', color = maColors)
//}

// SET UP VARIABLES FOR LINE OPERATION {
var bool can_draw = false
var bool can_draw2 = false
var bool midNightOpenDraw = false
var line midLine = na
var line NYopenHighLine = na
var line NYopenLowLine = na
var line openMidLine = na
var line openHighLine = na
var line openLowLine = na
var line midNiteHighLine = na
var line midNiteLowLine = na
var line midNiteMidLine = na
//}

is_new_session = hour == 8 and minute == 30
marketOpen = hour == 17 and minute == 00
end_of_morning_trades = hour == 10 and minute == 30
midNightOpen = hour == 23 and minute == 00

//bgcolor(is_new_session ? color.new(color.green, 85) : na)
//---------------------- get 930 mid point draw line ---------------------------------------------------//
if is_new_session
    // draws a vertical line at 930 open
    line.new(bar_index, close, bar_index, close * 1.01, extend = extend.both, color = color.rgb(255, 82, 82, 75), style = line.style_dashed)

if is_new_session and showNYOpen
    can_draw := true // We are allowed to draw a line keep
    midLine := line.new(bar_index, midPoint, bar_index, midPoint, xloc.bar_index, style = line.style_solid, color = color.rgb(221, 219, 208))
    NYopenHighLine := line.new(bar_index, ubl, bar_index, ubl, xloc.bar_index, style = line.style_dashed, color = color.rgb(221, 219, 208))
    NYopenLowLine := line.new(bar_index, dbl, bar_index, dbl, xloc.bar_index, style = line.style_dashed, color = color.rgb(221, 219, 208))
    NYopenLowLine
else
    if can_draw
        linefill.new(NYopenHighLine, NYopenLowLine, color.rgb(221, 219, 208, 80))
        line.set_x2(NYopenHighLine, bar_index)
        line.set_x2(midLine, bar_index)
        line.set_x2(NYopenLowLine, bar_index)
        //if(barstate.islast)
        //   can_draw := false
        // session.islastbar stops line at end of usa session    
if session.islastbar
    can_draw := false
    can_draw
    ////////////////////////////////////////////////////////////////////////////////

if marketOpen and showSessionOPen
    can_draw2 := true // We are allowed to draw a line keep
    openMidLine := line.new(bar_index, midPoint, bar_index, midPoint, xloc.bar_index, style = line.style_solid, color = color.rgb(253, 212, 5))
    openHighLine := line.new(bar_index, ubl, bar_index, ubl, xloc.bar_index, style = line.style_dashed, color = color.rgb(253, 212, 5))
    openLowLine := line.new(bar_index, dbl, bar_index, dbl, xloc.bar_index, style = line.style_dashed, color = color.rgb(253, 212, 5))
    openLowLine
else
    if can_draw2
        linefill.new(openHighLine, openLowLine, color.rgb(253, 212, 5, 80))
        line.set_x2(openHighLine, bar_index)
        line.set_x2(openMidLine, bar_index)
        line.set_x2(openLowLine, bar_index)
        //if(barstate.islast)
        //    can_draw2 := false
        // session.islastbar stops line at end of usa session    
if session.islastbar
    can_draw2 := false
    can_draw2

if midNightOpen and showMidNiteOpen

    midNightOpenDraw := true // We are allowed to draw a line keep
    midNiteMidLine := line.new(bar_index, midPoint, bar_index, midPoint, xloc.bar_index, style = line.style_solid, color = color.rgb(5, 139, 248))
    midNiteHighLine := line.new(bar_index, ubl, bar_index, ubl, xloc.bar_index, style = line.style_dashed, color = color.rgb(5, 139, 248))
    midNiteLowLine := line.new(bar_index, dbl, bar_index, dbl, xloc.bar_index, style = line.style_dashed, color = color.rgb(5, 139, 248))
    midNiteLowLine




else
    if midNightOpenDraw
        linefill.new(midNiteHighLine, midNiteLowLine, color.rgb(5, 139, 248, 80))
        line.set_x2(midNiteHighLine, bar_index)
        line.set_x2(midNiteMidLine, bar_index)
        line.set_x2(midNiteLowLine, bar_index)
        //if(barstate.islast)
        //    can_draw2 := false
        // session.islastbar stops line at end of usa session    
if session.islastbar
    midNightOpenDraw := false
    midNightOpenDraw






//}
// CREATE GLOBAL VARS {
var int longActive = 0
var int shortActive = 0
var bool long_detect = false
var bool short_detect = false
var bool signalBarLong = false
var int fucitLong = 0
var int fucitShort = 0

var bool db_long_detect = false
var bool dt_short_detect = false
var bool lower_high = false
var bool higher_low = false
var bool x_sig_short_1 = false
var bool x_sig_long_1 = false

// Create false signal code
var bool false_db_long_detect = false
var bool false_dt_short_detect = false
var bool false_lower_high = false
var bool false_higher_low = false
//}

// CREATE TRADE SIGNALS{

// Create if statement for up to 5 bar count

// (db = double bottom) (dt = double top)
// (db = double bottom) (dt = double top)
db_long_detect := low > low[1] and low[1] == low[2] and close > high[1]
dt_short_detect := high < high[1] and high[1] == high[2] and close < low[1]
lower_high := high < high[1] and high[1] > high[2] and close < low[1]
higher_low := low > low[1] and low[1] < low[2] and close > high[1]

x_sig_short_1 := high < high[1] and high[1] < high[2] and close[1] >= low[2] and close[1] <= high[2] and high[2] > high[3] and close < low[1]
// Reversed Long Signal
x_sig_long_1  := low > low[1] and low[1] > low[2] and low[2] < low[3] and close[1] <= high[2] and close[1] >= low[2] and close >= high[1]

oneLong =  x_sig_long_1 or higher_low or db_long_detect
oneShort = x_sig_short_1 or lower_high or dt_short_detect
// plotshape(x_sig_short_1, 'false db long signal', style = shape.diamond, location = location.abovebar, color = color.yellow, size = size.auto)
// plotshape(x_sig_long_1, 'false db long signal', style = shape.diamond, location = location.belowbar, color = color.rgb(8, 243, 71), size = size.auto)

// Create false signal code
false_db_long_detect := low > low[1] and low[1] == low[2] and high > high[1] and close <= high[1]
false_dt_short_detect := high < high[1] and high[1] == high[2] and low < low[1] and close >= low[1]
false_lower_high := high < high[1] and high[1] > high[2] and low < low[1] and close >= low[1]
false_higher_low := low > low[1] and low[1] < low[2] and high > high[1] and close <= high[1]





long_detect  := longActive  == 0 ? oneLong  : false
short_detect := shortActive == 0 ? oneShort : false

if long_detect
    longActive  := 1
    shortActive := 0
    fucitLong   := 1
    fucitShort  := 0
    shortActive

if short_detect
    shortActive := 1
    longActive  := 0
    fucitShort  := 1
    fucitLong   := 0
    longActive

long  = longActive   == 1 ? long_detect  : false
short = shortActive  == 1 ? short_detect : false




longPrice  = ta.valuewhen(long,  low[1],  0)
shortPrice = ta.valuewhen(short, high[1], 0)
lowBreak   = low  <= longPrice
highBreak  = high >= shortPrice

if lowBreak
    longActive  := 0
    longActive
if highBreak
    shortActive := 0
    shortActive

//}


// PLOT DRAWINGS TO CHART{
// plotshape(shortActive == 1 ? false_db_long_detect : false, 'false db long signal', style = shape.xcross, location = location.belowbar, color = color.yellow, size = size.auto)

// plotshape(longActive == 1 ? false_dt_short_detect : false, 'false db long signal', style = shape.xcross, location = location.abovebar, color = color.rgb(235, 7, 252), size = size.auto)

plotshape(fucitShort == 1 ? false_higher_low : false, 'false long signal', style = shape.xcross, location = location.belowbar, color = color.yellow, size = size.auto)

plotshape(fucitLong == 1 ? false_lower_high : false, 'false long signal', style = shape.xcross, location = location.abovebar, color = color.rgb(235, 7, 252), size = size.auto)


plotshape(long, 'long signal', style = shape.triangleup, location = location.belowbar, color = color.green, size = size.auto,offset = 0)
plotshape(short, 'short signal', style = shape.triangledown, location = location.abovebar, color = color.red, size = size.auto,offset = 0)
// plotshape(gohigh,"short signal",style = shape.xcross,location = location.abovebar,
//      color = color.red,size = size.auto)
// Plot Characters To CHART
plotchar(barMid, title = 'Mid point of bar', char = '-', location = location.absolute, color = midColor, size = size.small)
// plotchar(signalBarLong,title = "Profit target 2",char = "-",location = location.absolute,
//      color = color.blue, size = size.small )
plotchar(long ? profitTarget1 : na, title = 'profitTarget1', char = '-', location = location.absolute, color = color.gray, size = size.small)
plotchar(short ? stopTarget : na, title = 'profitTarget1', char = '-', location = location.absolute, color = color.yellow, size = size.small, offset = 0)

plotchar(long ? profitTarget2 : na, title = 'profitTarget2', char = '-', location = location.absolute, color = color.blue, size = size.small)
plotchar(long ? stopTarget : na, title = 'profitTarget1', char = '-', location = location.absolute, color = color.yellow, size = size.small, offset = 0)
plotchar(short ? profitTarget2 : na, title = 'Profit target 2', char = '-', location = location.absolute, color = color.yellow, size = size.small)
plotchar(short ? profitTarget1 : na, title = 'profitTarget1', char = '-', location = location.absolute, color = color.gray, size = size.small)
plotchar(showMids ? ubl : na, title = 'barMidPoint', char = '-', location = location.absolute, color = ublColor, size = size.small)
plotchar(showMids ? dbl : na, title = 'barMidPoint', char = '-', location = location.absolute, color = dblColor, size = size.small)

//plot(a4)    


//}
