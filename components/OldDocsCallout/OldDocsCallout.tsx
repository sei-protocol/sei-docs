import { Callout } from 'nextra-theme-docs';

function OldDocsCallout() {
	return (
		<div className='my-4'>
			<Callout emoji='🔍'>
				<p>
					Looking for the old docs?{' '}
					<a className='nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]' href='https://old.docs.sei.io/'>
						Click here
					</a>
				</p>
			</Callout>
		</div>
	);
}

export default OldDocsCallout;
