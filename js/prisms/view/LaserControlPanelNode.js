// Copyright 2002-2015, University of Colorado
/**
 * Control panel for the laser in the "prism break" tab,
 * such as choosing whether it is white light or one color, and the wavelength.
 * @author Sam Reid
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var WavelengthSlider = require( 'SCENERY_PHET/WavelengthSlider' );
  var LaserColor = require( 'BENDING_LIGHT/common/view/LaserColor' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ArrowButton = require( 'SCENERY_PHET/buttons/ArrowButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );

  // strings
  var oneColorString = require( 'string!BENDING_LIGHT/oneColor' );
  var whiteLightString = require( 'string!BENDING_LIGHT/whiteLight' );
  var units_nmString = require( 'string!BENDING_LIGHT/units_nm' );

  // constants
  var PLUS_MINUS_SPACING = 4;


  /**
   *
   * @param laserColor
   * @param wavelengthProperty
   * @param options
   * @constructor
   */
  function LaserControlPanelNode( laserColor, wavelengthProperty, options ) {


    options = _.extend( {
      fill: '#EEEEEE ',
      stroke: '#8B8B8B',
      lineWidth: 2,
      cornerRadius: 5
    }, options );

    var createButtonTextNode = function( text ) {
      return new Text( text, { font: new PhetFont( 12 ) } );
    };

    var AQUA_RADIO_BUTTON_OPTIONS = { radius: 6, font: new PhetFont( 12 ) };
    // Create the radio buttons
    var whiteLightRadio = new AquaRadioButton( laserColor, new LaserColor.WHITE_LIGHT(), createButtonTextNode( whiteLightString ),
      AQUA_RADIO_BUTTON_OPTIONS );
    var oneColorRadio = new AquaRadioButton( laserColor, new LaserColor.OneColor( wavelengthProperty.get() ), createButtonTextNode( oneColorString ),
      AQUA_RADIO_BUTTON_OPTIONS );

    var maxRadioButtonWidth = _.max( [ whiteLightRadio, oneColorRadio ], function( item ) {
      return item.width;
    } ).width;

    //touch areas
    var touchExpansion = 5;
    oneColorRadio.touchArea = new Bounds2(
      ( oneColorRadio.localBounds.minX - touchExpansion ),
      oneColorRadio.localBounds.minY,
      ( oneColorRadio.localBounds.minX + maxRadioButtonWidth ),
      oneColorRadio.localBounds.maxY
    );

    var wavelength = new Property( wavelengthProperty.value * 1E9 );
    // Create  WavelengthSlider node
    var wavelengthSlider = new WavelengthSlider( wavelength,
      {
        cursorStroke: 'white',
        thumbWidth: 20,
        thumbHeight: 20,
        trackWidth: 170,
        trackHeight: 20,
        tweakersVisible: false,
        valueVisible: false,
        thumbTouchAreaExpandY: 10,
        pointerAreasOverTrack: true
      } );

    var wavelengthValueText = new Text( wavelength.get() + units_nmString );
    var wavelengthBoxShape = new Rectangle( 0, 0, 50, 18, 2, 2,
      { fill: 'white', stroke: 'black' } );

    var plusButton = new ArrowButton( 'right', function propertyPlus() {
      wavelength.set( Math.min( wavelength.get() + 1, VisibleColor.MAX_WAVELENGTH ) );
    }, {
      scale: 0.6
    } );
    plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
      plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 20 );

    var minusButton = new ArrowButton( 'left', function propertyMinus() {
      wavelength.set( Math.max( wavelength.get() - 1, VisibleColor.MIN_WAVELENGTH ) );
    }, {
      scale: 0.6
    } );
    minusButton.touchArea = new Bounds2( minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5,
      minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 20 );

    wavelengthBoxShape.centerX = wavelengthSlider.centerX;
    wavelengthBoxShape.bottom = wavelengthSlider.top - 10;

    wavelengthValueText.centerX = wavelengthBoxShape.centerX;
    wavelengthValueText.centerY = wavelengthBoxShape.centerY;

    // plus button to the right of the value
    plusButton.left = wavelengthBoxShape.right + PLUS_MINUS_SPACING;
    plusButton.centerY = wavelengthBoxShape.centerY;

    // minus button to the left of the value
    minusButton.right = wavelengthBoxShape.left - PLUS_MINUS_SPACING;
    minusButton.centerY = wavelengthBoxShape.centerY;


    var wavelengthValue = new Node( {
      children: [ minusButton, wavelengthBoxShape, wavelengthValueText,
        plusButton, wavelengthSlider ]
    } );

    var content = new VBox( {
      spacing: 10,
      children: [ whiteLightRadio, oneColorRadio, wavelengthValue ],
      align: 'left'
    } );
    wavelength.link( function( wavelength ) {
      wavelengthProperty.set( wavelength / 1E9 );
      wavelengthValueText.text = wavelength + units_nmString;
    } );


    Panel.call( this, content, options );
  }

  return inherit( Panel, LaserControlPanelNode );
} );

