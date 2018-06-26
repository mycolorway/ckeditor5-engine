import { Client, syncClients, expectClients } from './utils.js';

describe( 'transform', () => {
	let john, kate;

	beforeEach( () => {
		return Promise.all( [
			Client.get( 'john' ).then( client => john = client ),
			Client.get( 'kate' ).then( client => kate = client )
		] );
	} );

	afterEach( () => {
		return Promise.all( [ john.destroy(), kate.destroy() ] );
	} );

	describe( 'insert', () => {
		describe( 'by insert', () => {
			it( 'elements at same position #1', () => {
				john.setData( '[]<paragraph>Foo</paragraph>' );
				kate.setData( '[]<paragraph>Foo</paragraph>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.insert( '<paragraph>Xyz</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<paragraph>Xyz</paragraph>' +
					'<paragraph>Foo</paragraph>'
				);
			} );

			it( 'elements at same position #2', () => {
				john.setData( '[]<paragraph>Foo</paragraph>' );
				kate.setData( '[]<paragraph>Foo</paragraph>' );

				kate.insert( '<paragraph>Xyz</paragraph>' );
				john.insert( '<paragraph>Abc</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<paragraph>Xyz</paragraph>' +
					'<paragraph>Foo</paragraph>'
				);
			} );

			it( 'elements in same parent', () => {
				john.setData( '[]<paragraph>Foo</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph>[]' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.insert( '<paragraph>Xyz</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph>Xyz</paragraph>'
				);
			} );

			it( 'elements in same path', () => {
				john.setData( '[]<blockQuote><paragraph>Foo</paragraph></blockQuote>' );
				kate.setData( '<blockQuote>[]<paragraph>Foo</paragraph></blockQuote>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.insert( '<paragraph>Xyz</paragraph>' );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<blockQuote>' +
						'<paragraph>Xyz</paragraph>' +
						'<paragraph>Foo</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'text at different paths', () => {
				john.setData( '<paragraph>Abc[]</paragraph><paragraph>Xyz</paragraph>' );
				kate.setData( '<paragraph>Abc</paragraph><paragraph>[]Xyz</paragraph>' );

				john.type( 'Foo' );
				kate.type( 'Bar' );

				syncClients();

				expectClients(
					'<paragraph>AbcFoo</paragraph>' +
					'<paragraph>BarXyz</paragraph>'
				);
			} );
		} );

		describe( 'by move', () => {
			it( 'element at different paths #1', () => {
				john.setData( '[]<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );
				kate.setData( '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.move( [ 1, 0 ], [ 1, 1 ], [ 1, 3 ] );

				syncClients();

				expectClients(
					'<paragraph>Abc</paragraph>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph>arB</paragraph>'
				);
			} );

			it( 'element at different paths #2', () => {
				john.setData( '<blockQuote><paragraph>Foo</paragraph>[]</blockQuote><paragraph>Bar</paragraph>' );
				kate.setData( '<blockQuote><paragraph>Foo</paragraph></blockQuote><paragraph>Bar</paragraph>' );

				john.insert( '<paragraph>Abc</paragraph>' );
				kate.move( [ 0, 0, 0 ], [ 1, 1 ], [ 1, 3 ] );

				syncClients();

				expectClients(
					'<blockQuote>' +
					'<paragraph>arFoo</paragraph>' +
					'<paragraph>Abc</paragraph>' +
					'</blockQuote>' +
					'<paragraph>B</paragraph>'
				);
			} );

			it.skip( 'text at same path', () => {
				john.setData( '<paragraph>Foo Bar</paragraph>' );
				john.setSelection( [ 0, 1 ] );

				kate.setData( '<paragraph>Foo Bar</paragraph>' );

				john.type( 'Abc' );
				kate.move( [ 0, 0 ], [ 0, 5 ], [ 0, 7 ] );

				syncClients();

				expectClients(
					'<paragraph>arFAbcoo B</paragraph>'
				);
			} );

			it( 'text at same position #1', () => {
				john.setData( '<paragraph>Foo Bar</paragraph>' );
				john.setSelection( [ 0, 3 ] );

				kate.setData( '<paragraph>Foo Bar</paragraph>' );

				john.type( 'Abc' );
				kate.move( [ 0, 3 ], [ 0, 4 ], [ 0, 7 ] );

				syncClients();

				expectClients(
					'<paragraph>FooAbcBar </paragraph>'
				);
			} );

			it( 'text at same position #2', () => {
				john.setData( '<paragraph>Foo Bar</paragraph>' );
				john.setSelection( [ 0, 4 ], [ 0, 7 ] );

				kate.setData( '<paragraph>Foo Bar</paragraph>' );

				john.type( 'Abc' );
				kate.move( [ 0, 0 ], [ 0, 4 ], [ 0, 7 ] );

				syncClients();

				expectClients(
					'<paragraph>BarFoo Abc</paragraph>'
				);
			} );
		} );
	} );
} );
