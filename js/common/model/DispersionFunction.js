// Copyright 2002-2015, University of Colorado
/**
 * Models dispersion functions for each material.  Uses the actual dispersion equation for air (A) and the actual dispersion equation for glass (G)
 * then interpolates between the functions n(lambda) = beta * A(lambda) + (1-beta) * G(lambda) where 0<=beta<=infinity is a characteristic of the material.
 * The material is characterized by a reference wavelength, so that when light is the specified wavelength, the index of refraction takes the reference value.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Util = require( 'DOT/Util' );

  //constants
  var WAVELENGTH_RED = 650E-9;

  /**
   *
   * @param referenceIndexOfRefraction
   * @param wavelength
   * @constructor
   */
  function DispersionFunction( referenceIndexOfRefraction, wavelength ) {

    this.referenceIndexOfRefraction = referenceIndexOfRefraction;
    this.referenceWavelength = wavelength;
  }

  return inherit( Object, DispersionFunction, {

    //See http://en.wikipedia.org/wiki/Sellmeier_equation
    /**
     *
     * @param wavelength
     * @returns {number}
     */
    getSellmeierValue: function( wavelength ) {
      var L2 = wavelength * wavelength;
      var B1 = 1.03961212;
      var B2 = 0.231792344;
      var B3 = 1.01046945;
      //convert to metric
      var C1 = 6.00069867E-3 * 1E-12;
      var C2 = 2.00179144E-2 * 1E-12;
      var C3 = 1.03560653E2 * 1E-12;
      return Math.sqrt( 1 + B1 * L2 / (L2 - C1) + B2 * L2 / (L2 - C2) + B3 * L2 / (L2 - C3) );
    },
    getIndexOfRefractionForRed: function() {
      return this.getIndexOfRefraction( WAVELENGTH_RED );
    },
    //See class-level documentation for an explanation of this algorithm
    /**
     *
     * @param wavelength
     * @returns {number}
     */
    getIndexOfRefraction: function( wavelength ) {
      //Get the reference values
      var nAirReference = this.getAirIndex( this.referenceWavelength );
      var nGlassReference = this.getSellmeierValue( this.referenceWavelength );
      //Determine the mapping and make sure it is in a good range
      var delta = nGlassReference - nAirReference;
      //0 to 1 (air to glass)
      var x = (this.referenceIndexOfRefraction - nAirReference) / delta;
      x = Util.clamp( 0, x, Number.POSITIVE_INFINITY );
      //Take a linear combination of glass and air equations
      return x * this.getSellmeierValue( wavelength ) + (1 - x) * this.getAirIndex( wavelength );
    },
    //See http://refractiveindex.info/?group=GASES&material=Air

    /**
     * private
     * @param wavelength
     * @returns {number}
     */
    getAirIndex: function( wavelength ) {
      return 1 + 5792105E-8 / (238.0185 - Math.pow( wavelength * 1E6, -2 )) + 167917E-8 / (57.362 - Math.pow( wavelength * 1E6, -2 ));
    },
    /*
     * Prints out the dispersion functions for several substances.
     */
    main: function( args ) {
      var states = [].withAnonymousClassBody( {
        initializer: function() {
          //no need to translate since dev test
          add( new Pair( "Air", 1.000293 ) );
          add( new Pair( "Water", 1.333 ) );
          add( new Pair( "Glass", 1.5 ) );
          add( new Pair( "Diamond", 2.419 ) );
        }
      } );
      var dispersionFunctions = [].withAnonymousClassBody( {
        initializer: function() {
          for ( var state in states ) {
            add( new DispersionFunction( state._2 ) );
            console.log( state + " -> " + new DispersionFunction( state._2 ).getIndexOfRefractionForRed() );
          }
        }
      } );
      console.log();
      var minLambda = 350E-9;
      var maxLambda = 800E-9;
      var numSteps = 100;
      var dLambda = (maxLambda - minLambda) / numSteps;
      console.log( "Wavelength\t" );
      for ( var state in states ) {
        console.log( state + "\t" );
      }
      console.log();
      for ( var lambda = minLambda; lambda <= maxLambda; lambda += dLambda ) {
        console.log( lambda + "\t" );
        for ( var dispersionFunction in dispersionFunctions ) {
          console.log( dispersionFunction.getIndexOfRefraction( lambda ) + "\t" );
        }
        console.log();
      }
    }
  } );
} );
