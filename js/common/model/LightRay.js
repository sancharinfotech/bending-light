// Copyright 2002-2015, University of Colorado
/**
 * A LightRay models one straight segment of a beam (completely within
 * a single medium), with a specific wavelength.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni(Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );
  var Line = require( 'KITE/segments/Line' );


  // constants
  var SPEED_OF_LIGHT = 2.99792458E8;

  /**
   *
   * @param trapeziumWidth
   * @param tail
   * @param tip
   * @param indexOfRefraction
   * @param wavelength
   * @param powerFraction
   * @param color
   * @param waveWidth
   * @param numWavelengthsPhaseOffset
   * @param oppositeMedium
   * @param extend
   * @param extendBackwards
   * @constructor
   */
  function LightRay( trapeziumWidth,tail, tip, indexOfRefraction, wavelength, powerFraction, color, waveWidth, numWavelengthsPhaseOffset, oppositeMedium, extend, extendBackwards ) {

    // Used to create a clipped shape for wave mode
    this.oppositeMedium = oppositeMedium;

    // fill in the triangular chip near y=0 even for truncated beams, if it is the transmitted beam
    // Light must be extended backwards for the transmitted wave shape to be correct
    this.extendBackwards = extendBackwards;
    this.color = color;
    this.waveWidth = waveWidth;
    this.trapeziumWidth = trapeziumWidth;
    // Directionality is important for propagation
    this.tip = tip;
    this.tail = tail;

    // The index of refraction of the medium the lightray inhabits
    this.indexOfRefraction = indexOfRefraction;
    this.wavelength = wavelength;    // wavelength in meters

    // amount of power this light has (full strength is 1.0)
    this.powerFraction = powerFraction;

    // This number indicates how many wavelengths have passed before this light ray begins;
    // it is zero for the light coming out of the laser.
    this.numWavelengthsPhaseOffset = numWavelengthsPhaseOffset;

    // has to be an integral number of wavelength so that the phases work out correctly,
    // turing this up too high past 1E6 causes things not to render properly
    this.extend = extend;
  }

  return inherit( Object, LightRay, {

    getSpeed: function() {
      return SPEED_OF_LIGHT / this.indexOfRefraction;
    },

    getPowerFraction: function() {
      return this.powerFraction;
    },
    //Check to see if this light ray hits the specified sensor region
    /*    intersects: function( sensorRegion ) {
     return !new Area( sensorRegion ).withAnonymousClassBody( {
     initializer: function() {
     //Use a stroke smaller than the characteristic length scale to promote
     // the line to a shape for hit detection
     intersect( new Area( new BasicStroke( 1E-10
     f
     ).
     createStrokedShape( toLine2D() )
     ))
     ;
     }
     } ).isEmpty();
     },*/
    toLine2D: function() {
    return new Line( this.tail, this.tip );
    },
    getLength: function() {
      return this.tip.minus( this.tail ).magnitude();
    },
    toVector2D: function() {
      var initialPoint = this.tail;
      var finalPoint = this.tip;
      return new Vector2( finalPoint.x - initialPoint.x,
        finalPoint.y - initialPoint.y );
    },
    getColor: function() {
      return this.color;
    },
    getWavelength: function() {
      return this.wavelength;
    },


    // The wave is wider than the ray, and must be clipped against the opposite medium so it doesn't leak over
    getWaveShape: function() {
      var tailWidth =   this.waveWidth;
      var tipWidth =   this.trapeziumWidth;
      // tip point
      var tipPoint1 = new Vector2( this.tip.x + tipWidth/2 , this.tip.y );
      var tipPoint2 = new Vector2( this.tip.x - tipWidth/2, this.tip.y );

      //tail
      var tailPoint1 = new Vector2( this.tail.x + tailWidth / 2, this.tail.y );
      var tailPoint2 = new Vector2( this.tail.x - tailWidth / 2, this.tail.y );
      var shape = new Shape();
      shape.moveTo( tailPoint1.x, tailPoint1.y )
        .lineTo( tailPoint2.x, tailPoint2.y )
        .lineTo( tipPoint2.x, tipPoint2.y )
        .lineTo( tipPoint1.x, tipPoint1.y )
        .close();
      return shape;
    },


    getUnitVector: function() {
      var x = this.tip.x - this.tail.x;
      var y = this.tip.y - this.tail.y;
      return new Vector2( x, y ).normalized();
    },
    getAngle: function() {
      return this.toVector2D().angle();
    },
    // todo:Update the time and notify wave listeners so they can update the phase of the wave graphic

    getWaveWidth: function() {
      return this.waveWidth;
    },
    getNumberOfWavelengths: function() {
      return this.getLength() / this.wavelength;
    },
    getNumWavelengthsPhaseOffset: function() {
      return this.numWavelengthsPhaseOffset;
    },


    /**
     * Determine if the light ray contains the specified position,
     * accounting for whether it is shown as a thin light ray or wide wave
     * @param position
     * @param waveMode
     * @returns {*}
     */
    contains: function( position, waveMode ) {
      if ( waveMode ) {
        return this.getWaveShape().contains( position.x, position.y );
      }
      else {
        // return new BasicStroke( getRayWidth() ).createStrokedShape( toLine2D() ).contains( position.toPoint2D() );
      }
    },
    getRayWidth: function() {
      //At the default transform, this yields a 4 pixel wide stroke
      return 1.5992063492063494E-7;
    },
    getVelocityVector: function() {
      return this.tip.minus( this.tail ).normalized().times( this.getSpeed() );
    },
    getFrequency: function() {
      return this.getSpeed() / this.getWavelength();
    },
    getAngularFrequency: function() {
      return this.getFrequency() * Math.PI * 2;
    },
    getPhaseOffset: function() {
      //return this.getAngularFrequency() * time - 2 * Math.PI * this.numWavelengthsPhaseOffset;
    },

    /**
     * Get the total argument to the cosine for the wave function(k * x - omega * t + phase)
     * @param distanceAlongRay
     * @returns {number}
     */
    getCosArg: function( distanceAlongRay ) {
      var w = this.getAngularFrequency();
      var k = 2 * Math.PI / this.getWavelength();
      var x = distanceAlongRay;
      var t = this.time;
      return k * x - w * t - 2 * Math.PI * this.numWavelengthsPhaseOffset;
    },
    getTime: function() {
      return this.time;
    }
  } );
} );

