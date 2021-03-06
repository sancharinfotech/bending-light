// Copyright 2002-2015, University of Colorado
/**
 * The normal line is a graphic that indicates the point of intersection of the light ray and
 * the perpendicular angle at the interface.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  /**
   *
   * @param {Number}height
   * @constructor
   */
  function NormalLine( height ) {
    Node.call( this );
    //Normal Line
    var x = 0;
    var y1 = 0;
    var shape = new Shape()
      .moveTo( x, y1 )//x1,y1
      .lineTo( x, height );//x2,y2

    this.addChild( new Path( shape, { stroke: 'black', lineDash: [ 6, 4 ] } ) );

  }

  return inherit( Node, NormalLine );
} );

