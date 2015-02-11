// Copyright 2002-2015, University of Colorado
/**
 * Base class for Bending Light
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var LaserNode = require( 'BENDING_LIGHT/common/view/LaserNode' );
  var LaserView = require( 'BENDING_LIGHT/common/view/LaserView' );

  //Font for labels in controls
  var labelFont = new PhetFont( 16 );

  /**
   *
   * @param bendingLightModel
   * @param showNormal
   * @constructor
   */
  function BendingLightView( bendingLightModel, showNormal ) {

    ScreenView.call( this, { renderer: 'svg', layoutBounds: new Bounds2( 0, 0, 834, 504 ) } );

    var bendingLightView = this;
    this.showProtractor = new BooleanProperty( false );
    this.model = bendingLightModel;
    this.lightRayLayer = new Node();
    this.lightWaveLayer = new Node();
    this.laserView = new LaserView( bendingLightModel );

    //In order to make controls (including the laser itself) accessible (not obscured by the large protractor), KP suggested this layering order:
    //laser on top
    //Control boxes next
    //Protractor
    //Laser beam
    //To implement this, we specify before light layer and 2 after light layers
    this.beforeLightLayer = new Node();
    //in back of afterLightLayer2
    this.afterLightLayer = new Node();
    this.afterLightLayer2 = new Node();

    this.showNormal = new BooleanProperty( showNormal );
    // Root of our scene graph
    var rootNode = new Node();
    this.addChild( rootNode );
    var stageWidth = 834;
    var stageHeight = 504;

    //Use the model aspect ratio and specified stage width to create the stage dimension
    this.stageSize = new Dimension2( stageWidth, stageHeight );
    //Center the stage in the canvas, specifies how things scale up and down with window size, maps stage to pixels
    //Create the transform from model (SI) to view (stage) coordinates
    var scale = this.stageSize.height / this.model.getHeight();
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( stageWidth / 2, stageHeight / 2 ), scale );

    //Create and add the graphic for the environment medium
    this.mediumNode = new Node();
    this.addChild( this.mediumNode );


    //var whiteLightNode = new WhiteLightNode( this.lightRayLayer, this.stageSize.getWidth(), this.stageSize.getHeight() );
    //layering
    this.addChild( this.beforeLightLayer );
    this.addChild( this.lightRayLayer );
    this.addChild( this.lightWaveLayer );
    //this.addChild( whiteLightNode );
    this.addChild( this.afterLightLayer );
    this.addChild( this.afterLightLayer2 );
    //Add the laser itself
    var laserNode = new LaserNode( this.modelViewTransform, bendingLightModel.getLaser()/*, showRotationDragHandles, showTranslationDragHandles, clampDragAngle, laserTranslationRegion, laserRotationRegion, laserImageName, model.visibleModelBounds */ );
    this.addChild( laserNode );


    bendingLightModel.rays.addItemAddedListener( function( ray ) {
      var node;
      var layer;
      if ( bendingLightModel.laserViewProperty.value === 'ray' ) {
        node = bendingLightView.laserView.rayNode.createNode( bendingLightView.modelViewTransform, ray );
        layer = bendingLightView.laserView.rayNode.getLayer( bendingLightView.lightRayLayer, bendingLightView.lightWaveLayer );
      }
      else {
        node = bendingLightView.laserView.waveNode.createNode( bendingLightView.modelViewTransform, ray );
        layer = bendingLightView.laserView.waveNode.getLayer( bendingLightView.lightRayLayer, bendingLightView.lightWaveLayer );
      }

      layer.addChild( node );
    } );
    bendingLightModel.rays.addItemRemovedListener( function( ray ) {
      for ( var i = 0; i < bendingLightView.lightRayLayer.getChildrenCount(); i++ ) {
        bendingLightView.lightRayLayer.removeChild( bendingLightView.lightRayLayer.children[ i ] );
      }
      for (  i = 0; i < bendingLightView.lightWaveLayer.getChildrenCount(); i++ ) {
        bendingLightView.lightWaveLayer.removeChild( bendingLightView.lightWaveLayer.children[ i ] );
      }
    } );


  }

  return inherit( ScreenView, BendingLightView, {},
    //statics
    {
      labelFont: labelFont
    } );
} );
