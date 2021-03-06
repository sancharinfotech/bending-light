// Copyright 2002-2015, University of Colorado
/**
 * Controls for changing and viewing the medium type, including its current index of refraction
 * (depends on the laser wavelength through the dispersion function).
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni(Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var ComboBox = require( 'SUN/ComboBox' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HSlider = require( 'SUN/HSlider' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var MediumColorFactory = require( 'BENDING_LIGHT/common/model/MediumColorFactory' );
  var Medium = require( 'BENDING_LIGHT/common/model/Medium' );
  var DispersionFunction = require( 'BENDING_LIGHT/common/model/DispersionFunction' );
  var MediumState = require( 'BENDING_LIGHT/common/model/MediumState' );
  var ArrowButton = require( 'SCENERY_PHET/buttons/ArrowButton' );
  var Util = require( 'DOT/Util' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var BendingLightModel = require( 'BENDING_LIGHT/common/model/BendingLightModel' );
  var HStrut = require( 'SUN/HStrut' );

  // strings
  var airString = require( 'string!BENDING_LIGHT/air' );
  var waterString = require( 'string!BENDING_LIGHT/water' );
  var glassString = require( 'string!BENDING_LIGHT/glass' );
  var customString = require( 'string!BENDING_LIGHT/custom' );
  var unknownString = require( 'string!BENDING_LIGHT/unknown' );
  var indexOfRefractionColonString = require( 'string!BENDING_LIGHT/indexOfRefractionWithSymbol' );
  var indexOfRefractionString = require( 'string!BENDING_LIGHT/indexOfRefraction' );

  // constants
  var INDEX_OF_REFRACTION_MIN = 1;
  var INDEX_OF_REFRACTION_MAX = 1.6;
  var PLUS_MINUS_SPACING = 4;
  var mediumColorFactory = new MediumColorFactory();

  /**
   *
   * @param view
   * @param medium
   * @param name
   * @param textFieldVisible
   * @param laserWavelength
   * @param format
   * @param options
   * @constructor
   */
  function MediumControlPanel( view, medium, name, textFieldVisible, laserWavelength, format, options ) {

    Node.call( this );
    var mediumControlPanel = this;

    options = _.extend( {
      xMargin: 10,
      yMargin: 7,
      fill: '#f2fa6a ',
      stroke: 'gray',
      lineWidth: 1
    }, options );
    this.medium = medium; //The medium to observe
    this.laserWavelength = laserWavelength;
    var initialMediumState = medium.get().getMediumState();
    this.lastNonMysteryIndexAtRed = initialMediumState.getIndexOfRefractionForRedLight();
    var CUSTOM = new MediumState( customString, BendingLightModel.MYSTERY_B.getIndexOfRefractionForRedLight() + 1.2, false, true );
    this.custom = true;
    // add material combo box
    var materialTitle = new Text( name, { font: new PhetFont( 12 ), fontWeight: 'bold' } );
    var maxWidth = 140;
    var textOptionsOfComboBoxStrings = { font: new PhetFont( 10 ) };
    var createItem = function( item ) {
      var itemName = new Text( item.name, textOptionsOfComboBoxStrings );
      var strutWidth = maxWidth - itemName.width;
      return ComboBox.createItem( new HBox( {
        children: [ itemName, new HStrut( strutWidth ) ]
      } ), item );
    };
    var mediumStates = [ BendingLightModel.AIR, BendingLightModel.WATER, BendingLightModel.GLASS, BendingLightModel.MYSTERY_A, BendingLightModel.MYSTERY_B, CUSTOM ];
    var comboBoxMediumState = new Property( initialMediumState );
    var updateComboBox = function() {
      var selected = -1;
      for ( var i = 0; i < mediumStates.length; i++ ) {
        var mediumState = mediumStates[ i ];
        if ( mediumState.dispersionFunction.getIndexOfRefraction( mediumControlPanel.laserWavelength.get() ) === medium.get().getIndexOfRefraction( mediumControlPanel.laserWavelength.get() ) ) {
          selected = i;
        }
      }
      //Only set to a different substance if "custom" wasn't specified.
      // Otherwise pressing "air" then "custom" will make the combobox jump back to "air"
      if ( selected !== -1 && !medium.get().getMediumState().custom ) {
        comboBoxMediumState.set( mediumStates[ selected ] );
        mediumControlPanel.custom = false;
      }
      else {
        //No match to a named medium, so it must be a custom medium
        comboBoxMediumState.set( CUSTOM );
        mediumControlPanel.custom = true;
      }
    };
    // items
    var items = [];
    for ( var i = 0; i < mediumStates.length; i++ ) {
      var material = mediumStates[ i ];
      items[ i ] = createItem( material );
    }
    var materialComboBox = new ComboBox( items, comboBoxMediumState, view, {
      labelNode: materialTitle,
      listPosition: 'below',
      buttonXMargin: 5,
      buttonYMargin: 2,
      buttonCornerRadius: 3,
      itemXMargin: 2,
      itemYMargin: 2
    } );

    var textOptions = { font: new PhetFont( 12 ) };
    var indexOfRefractionLabel = new Text( textFieldVisible ? indexOfRefractionColonString : indexOfRefractionString, textOptions );
    var mediumIndexProperty = new Property( medium.get().getIndexOfRefraction( this.laserWavelength.get() ) );
    var indexOfRefractionValueText = new Text( mediumIndexProperty.get().toFixed( format ), textOptions );
    var indexOfRefractionReadoutBoxShape = new Rectangle( 0, 0, 50, 20, 2, 2, {
      fill: 'white',
      stroke: 'black'
    } );

    var plusButton = new ArrowButton( 'right', function propertyPlus() {
      mediumControlPanel.custom = true;
      mediumIndexProperty.set( Util.toFixedNumber( Math.min( mediumIndexProperty.get() + 1 / Math.pow( 10, format ),
        INDEX_OF_REFRACTION_MAX ), format ) );
    }, {
      scale: 0.7
    } );
    plusButton.touchArea = new Bounds2( plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5,
      plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 20 );

    var minusButton = new ArrowButton( 'left', function propertyMinus() {
      mediumControlPanel.custom = true;
      mediumIndexProperty.set( Util.toFixedNumber( Math.max( mediumIndexProperty.get() - 1 / Math.pow( 10, format ),
        INDEX_OF_REFRACTION_MIN ), format ) );
    }, {
      scale: 0.7
    } );
    minusButton.touchArea = new Bounds2( minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5,
      minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 20 );

    indexOfRefractionValueText.centerX = indexOfRefractionReadoutBoxShape.centerX;
    indexOfRefractionValueText.centerY = indexOfRefractionReadoutBoxShape.centerY;

    // plus button to the right of the value
    plusButton.left = indexOfRefractionReadoutBoxShape.right + PLUS_MINUS_SPACING;
    plusButton.centerY = indexOfRefractionReadoutBoxShape.centerY;

    // minus button to the left of the value
    minusButton.right = indexOfRefractionReadoutBoxShape.left - PLUS_MINUS_SPACING;
    minusButton.centerY = indexOfRefractionReadoutBoxShape.centerY;

    indexOfRefractionLabel.right = minusButton.left - 10;
    indexOfRefractionLabel.centerY = minusButton.centerY;

    var airTitle = new Text( airString );
    var waterTitle = new Text( waterString );
    var glassTitle = new Text( glassString );
    var indexOfRefractionSlider = new HSlider( mediumIndexProperty,
      { min: INDEX_OF_REFRACTION_MIN, max: INDEX_OF_REFRACTION_MAX },
      {
        trackFill: 'white',
        trackSize: new Dimension2( 160, 1 ),
        thumbSize: new Dimension2( 10, 20 ),
        majorTickLength: 15,
        tickLabelSpacing: 3,
        startDrag: function() {
          mediumControlPanel.custom = true;
        }
      } );
    indexOfRefractionSlider.addMajorTick( BendingLightModel.AIR.getIndexOfRefractionForRedLight(), airTitle );
    indexOfRefractionSlider.addMajorTick( BendingLightModel.WATER.getIndexOfRefractionForRedLight(), waterTitle );
    indexOfRefractionSlider.addMajorTick( BendingLightModel.GLASS.getIndexOfRefractionForRedLight(), glassTitle );
    indexOfRefractionSlider.addMajorTick( 1.6 );

    var unknown = new Text( unknownString, {
      centerX: indexOfRefractionSlider.centerX,
      centerY: indexOfRefractionSlider.centerY
    } );

    var indexOfRefractionNode = new Node( {
      children: [ indexOfRefractionLabel, minusButton, indexOfRefractionReadoutBoxShape, indexOfRefractionValueText, plusButton, unknown ]
    } );

    var mediumPanelVBox = new VBox( {
      children: [ materialComboBox, indexOfRefractionNode, indexOfRefractionSlider ],
      spacing: 10
    } );

    var mediumPanel = new Panel( mediumPanelVBox, {
      fill: '#EEEEEE',
      xMargin: 7,
      yMargin: 7,
      cornerRadius: 5, lineWidth: options.lineWidth
    } );
    this.addChild( mediumPanel );

    Property.multilink( [ medium, this.laserWavelength ],
      function() {
        mediumControlPanel.custom = medium.get().getMediumState().custom;
        mediumIndexProperty.set( medium.get().getIndexOfRefraction( mediumControlPanel.laserWavelength.get() ) );
        indexOfRefractionValueText.text = medium.get().getIndexOfRefraction( laserWavelength.get() ).toFixed( format );
      } );


    medium.link( function() {
      indexOfRefractionNode.setVisible( !medium.get().isMystery() );
      unknown.setVisible( medium.get().isMystery() );
      indexOfRefractionSlider.setVisible( !medium.get().isMystery() );
      updateComboBox();
      if ( !medium.get().isMystery() ) {
        mediumControlPanel.lastNonMysteryIndexAtRed = medium.get().getIndexOfRefraction( BendingLightModel.WAVELENGTH_RED );
      }
    } );
    comboBoxMediumState.link( function( selected ) {
      if ( !selected.custom ) {
        mediumControlPanel.setMediumState( selected );
      }
      //If it was custom, then use the the index of refraction but keep the name as "custom"
      else {
        mediumControlPanel.setMediumState( new MediumState( selected.name, mediumControlPanel.lastNonMysteryIndexAtRed, selected.mystery, selected.custom ) );
      }
    } );

    mediumIndexProperty.link( function( indexOfRefraction ) {
      if ( mediumControlPanel.custom ) {
        mediumControlPanel.setCustomIndexOfRefraction( indexOfRefraction );
      }
      plusButton.enabled = ( indexOfRefraction < INDEX_OF_REFRACTION_MAX);
      minusButton.enabled = ( indexOfRefraction > INDEX_OF_REFRACTION_MIN );
    } );
  }

  return inherit( Node, MediumControlPanel, {

    /**
     * Called when the user enters a new index of refraction (with text box or slider),
     * updates the model with the specified value
     * @param indexOfRefraction
     */
    setCustomIndexOfRefraction: function( indexOfRefraction ) {
      //Have to pass the value through the dispersion function to account for the
      // current wavelength of the laser (since index of refraction is a function of wavelength)
      var dispersionFunction = new DispersionFunction( indexOfRefraction, this.laserWavelength.get() );
      this.setMedium( new Medium( this.medium.get().shape,
        new MediumState( customString, indexOfRefraction, false, true ),
        mediumColorFactory.getColor( dispersionFunction.getIndexOfRefractionForRed() )
      ) );
    },

    /**
     *  Update the medium state from the combo box
     * @param mediumState
     */
    setMediumState: function( mediumState ) {
      this.setMedium( new Medium( this.medium.shape, mediumState,
        mediumColorFactory.getColor(
          mediumState.getIndexOfRefractionForRedLight() ) ) );
    },

    /**
     *
     * @param mediumValue
     */
    setMedium: function( mediumValue ) {
      this.medium.set( mediumValue );
    }
  } );
} );


